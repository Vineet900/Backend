import { supabase } from '../database/supabase.js';
import { createCourseSchema, updateCourseSchema } from '../validations/courseValidation.js';

/**
 * @desc    Get all courses (public/published)
 * @route   GET /api/courses
 */
export const getCourses = async (req, res, next) => {
  try {
    // 1. Fetch all courses
    const { data: courses, error: courseErr } = await supabase
      .from('courses')
      .select('*')
      .order('id', { ascending: true });

    if (courseErr) throw courseErr;

    // 2. Fetch all lessons to link them (since DB relationship is broken)
    const { data: allLessons, error: lessonErr } = await supabase
      .from('lessons')
      .select('id, title, slug, chapter_number, course_id');

    if (lessonErr) throw lessonErr;

    // 3. Map lessons to courses manually
    const coursesWithLessons = courses.map(course => ({
      ...course,
      lessons: allLessons.filter(l => 
        l.course_id?.toLowerCase() === (course.slug || course.title)?.toLowerCase()
      )
    }));

    res.status(200).json({
      success: true,
      count: coursesWithLessons.length,
      data: coursesWithLessons
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single course with full content
 * @route   GET /api/courses/:id
 */
export const getCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Fetch course by slug or ID
    const isNumeric = !isNaN(id) && !id.includes('-');
    let query = supabase.from('courses').select('*');
    
    if (isNumeric) query = query.eq('id', id);
    else query = query.eq('slug', id);

    const { data: course, error } = await query.single();

    if (error || !course) {
      // Fallback to title if slug fails
      const { data: fallbackCourse } = await supabase.from('courses').select('*').ilike('title', id).single();
      if (!fallbackCourse) {
        return res.status(404).json({ success: false, message: 'Course not found in intelligence database' });
      }
      return res.status(200).json({ success: true, data: { ...fallbackCourse, lessons: [] } });
    }

    // 2. Fetch lessons for this course manually
    const { data: lessons, error: lessonErr } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', course.slug || course.title)
      .order('chapter_number', { ascending: true });

    if (lessonErr) throw lessonErr;

    res.status(200).json({ 
      success: true, 
      data: { ...course, lessons } 
    });
  } catch (err) {
    next(err);
  }
};



/**
 * @desc    Create new course (Admin/Instructor Only)
 * @route   POST /api/courses
 */
export const createCourse = async (req, res, next) => {
  try {
    const validatedData = createCourseSchema.parse(req.body);

    const { data: course, error } = await supabase
      .from('courses')
      .insert(validatedData)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update course (Admin/Instructor Only)
 * @route   PUT /api/courses/:id
 */
export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = updateCourseSchema.parse(req.body);

    const { data: course, error } = await supabase
      .from('courses')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};
/**
 * @desc    Get personalized daily learning plan
 * @route   GET /api/courses/daily-plan
 */
export const getDailyPlan = async (req, res, next) => {
  try {
    const { level = 'beginner' } = req.query;

    const { data: courses } = await supabase.from('courses').select('*').limit(5);
    const { data: lessons } = await supabase.from('lessons').select('*').limit(100);

    // Manual join
    const allLessons = lessons.filter(l => 
        l.level?.toLowerCase() === level.toLowerCase()
    );
    
    const randomLesson = allLessons.length > 0 
        ? allLessons[Math.floor(Math.random() * allLessons.length)]
        : lessons[0];

    res.status(200).json({
      success: true,
      data: {
        lesson: randomLesson?.title || 'Explore new horizons',
        exercise: `Practice ${randomLesson?.title || 'coding'} fundamentals`,
        quiz: `Take the ${randomLesson?.title || 'module'} assessment`,
        miniProject: `Build a mini project using ${randomLesson?.title || 'these skills'}`,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
};


/**
 * @desc    Delete course (Admin Only)
 * @route   DELETE /api/courses/:id
 */
export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
