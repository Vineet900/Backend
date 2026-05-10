import { supabase } from '../database/supabase.js';
import { config } from '../config/index.js';
import { createCourseSchema, updateCourseSchema } from '../validations/courseValidation.js';

/**
 * @desc    Get all courses with lesson counts
 * @route   GET /api/courses
 */
export const getCourses = async (req, res, next) => {
  try {
    const { data: courses, error: courseErr } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (courseErr) throw courseErr;

    const { data: allLessons, error: lessonErr } = await supabase
      .from('lessons')
      .select('id, title, slug, chapter_number, course_id');

    if (lessonErr) throw lessonErr;

    const coursesWithLessons = (courses || []).map(course => ({
      ...course,
      lessons: (allLessons || []).filter(l => {
        const lessonCourseId = l.course_id?.toString().toLowerCase();
        const courseSlug = course.slug?.toString().toLowerCase();
        const courseTitle = course.title?.toString().toLowerCase();
        return lessonCourseId === courseSlug || lessonCourseId === courseTitle;
      })
    }));

    res.status(200).json({
      success: true,
      count: coursesWithLessons.length,
      data: coursesWithLessons,
      courses: coursesWithLessons
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single course with lessons
 */
export const getCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isNumeric = !isNaN(id) && !id.includes('-');
    
    let query = supabase.from('courses').select('*');
    if (isNumeric) query = query.eq('id', id);
    else query = query.eq('slug', id);

    const { data: course, error } = await query.single();

    if (error || !course) {
      const { data: fallback } = await supabase.from('courses').select('*').ilike('title', id).single();
      if (!fallback) return res.status(404).json({ success: false, message: 'Course not found' });
      return res.status(200).json({ success: true, data: fallback, course: fallback });
    }

    const { data: lessons } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', course.slug || course.title)
      .order('chapter_number', { ascending: true });

    const courseData = { ...course, lessons: lessons || [] };

    res.status(200).json({ success: true, data: courseData, course: courseData });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Search courses
 */
export const searchCourses = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Search query required' });

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(10);

    if (error) throw error;
    res.status(200).json({ success: true, courses: data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get lesson by slug
 */
export const getLessonBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('*, courses(title, slug)')
      .eq('slug', slug)
      .single();

    if (error || !lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    res.status(200).json({ success: true, lesson });
  } catch (err) {
    next(err);
  }
};
