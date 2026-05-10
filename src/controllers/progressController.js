import { supabase } from '../database/supabase.js';
import { z } from 'zod';

const progressSchema = z.object({
  lessonId: z.string().uuid(),
  isCompleted: z.boolean(),
  watchTime: z.number().nonnegative().optional(),
});

/**
 * @desc    Update lesson progress with Strict Learning validation
 * @route   POST /api/v1/progress/lesson
 */
export const updateLessonProgress = async (req, res, next) => {
  try {
    const { lessonId, isCompleted, watchTime } = progressSchema.parse(req.body);
    const userId = req.user.id;

    // 1. Fetch current lesson and its section/course context
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*, sections(*)')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    // 2. STRICT LEARNING VALIDATION (Global Sequence Check)
    if (lesson.sort_order > 1) {
      const { data: prevLesson } = await supabase
        .from('lessons')
        .select('id, title')
        .eq('section_id', lesson.section_id) // Same section
        .eq('sort_order', lesson.sort_order - 1)
        .single();

      if (prevLesson) {
        const { data: prevProgress } = await supabase
          .from('user_progress')
          .select('is_completed')
          .eq('user_id', userId)
          .eq('lesson_id', prevLesson.id)
          .single();

        if (!prevProgress || !prevProgress.is_completed) {
          return res.status(403).json({ 
            success: false, 
            message: `Strict Learning: Please complete '${prevLesson.title}' first` 
          });
        }
      }
    } else {
        // If it's the first lesson of a section (sort_order 1), check if previous section is done
        const { data: prevSection } = await supabase
          .from('sections')
          .select('id')
          .eq('course_id', lesson.sections.course_id)
          .eq('sort_order', lesson.sections.sort_order - 1)
          .single();

        if (prevSection) {
            // Check if last lesson of prev section is completed
            const { data: lastLesson } = await supabase
              .from('lessons')
              .select('id, title')
              .eq('section_id', prevSection.id)
              .order('sort_order', { ascending: false })
              .limit(1)
              .single();

            if (lastLesson) {
                const { data: lp } = await supabase.from('user_progress').select('is_completed').eq('user_id', userId).eq('lesson_id', lastLesson.id).single();
                if (!lp || !lp.is_completed) {
                    return res.status(403).json({ success: false, message: `Strict Learning: Please complete the previous module first` });
                }
            }
        }
    }

    // 3. Upsert Progress
    const { data: progress, error: upsertError } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        is_completed: isCompleted,
        watch_time_seconds: watchTime || 0,
        completed_at: isCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,lesson_id' })
      .select()
      .single();

    if (upsertError) throw upsertError;

    // 4. Atomic Reward if newly completed
    if (isCompleted) {
      await supabase.rpc('award_user_reward', {
        p_user_id: userId,
        p_xp_amount: lesson.xp_reward || 50,
        p_sp_amount: 0,
        p_description: `Completed lesson: ${lesson.title}`
      });
      
      // Update streak activity
      await supabase.from('streaks').update({ last_activity_date: new Date().toISOString() }).eq('user_id', userId);
    }

    res.status(200).json({ success: true, data: progress });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get comprehensive course progress
 * @route   GET /api/v1/progress/:courseId
 */
export const getCourseProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('*, sections!inner(course_id), user_progress(*)')
      .eq('sections.course_id', courseId)
      .eq('user_progress.user_id', userId);

    if (error) throw error;

    const total = lessons.length;
    const completed = lessons.filter(l => l.user_progress[0]?.is_completed).length;

    res.status(200).json({
      success: true,
      data: {
        total_lessons: total,
        completed_lessons: completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        lessons: lessons.map(l => ({
          id: l.id,
          is_completed: l.user_progress[0]?.is_completed || false,
          watch_time: l.user_progress[0]?.watch_time_seconds || 0
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};
