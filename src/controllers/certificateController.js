import { supabase } from '../database/supabase.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * @desc    Generate certificate for course completion
 * @route   POST /api/certificates/generate/:courseId
 */
export const generateCertificate = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // 1. Verify all lessons completed
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, sections!inner(course_id)')
      .eq('sections.course_id', courseId);

    const { data: progress } = await supabase
      .from('user_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('is_completed', true);

    const completedIds = new Set(progress?.map(p => p.lesson_id));
    const allCompleted = lessons?.every(l => completedIds.has(l.id));

    if (!allCompleted) {
      return res.status(403).json({ success: false, message: 'Course not yet completed' });
    }

    // 2. Check if already exists
    const { data: existing } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (existing) {
      return res.status(200).json({ success: true, data: existing });
    }

    // 3. Generate unique verification code
    const verificationCode = `DS-${uuidv4().split('-')[0].toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const { data: certificate, error } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        course_id: courseId,
        verification_code: verificationCode,
        issued_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data: certificate });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Verify certificate by code
 * @route   GET /api/certificates/verify/:code
 */
export const verifyCertificate = async (req, res, next) => {
  try {
    const { code } = req.params;

    const { data, error } = await supabase
      .from('certificates')
      .select('*, profiles(full_name, username), courses(title)')
      .eq('verification_code', code)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Invalid certificate' });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
