import { supabase } from '../database/supabase.js';
import { z } from 'zod';

const quizSubmissionSchema = z.object({
  answers: z.array(z.number()),
  time_taken_seconds: z.number().positive(),
  violations: z.number().default(0),
});

/**
 * @desc    Submit quiz attempt with anti-cheat validation
 * @route   POST /api/v1/quizzes/:id/submit
 */
export const submitQuiz = async (req, res, next) => {
  try {
    const { id: quizId } = req.params;
    const { answers, time_taken_seconds, violations } = quizSubmissionSchema.parse(req.body);
    const userId = req.user.id;

    // 1. Fetch Quiz Data
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*, sections(course_id)')
      .eq('id', quizId)
      .single();

    if (quizError || !quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    // 2. Anti-Cheat: Simple validation
    // If violations are too high, we can flag the attempt or fail it automatically
    const isFlagged = violations > 3;

    // 3. Calculate Score
    const questions = quiz.questions;
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.answer_index) correctCount++;
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= quiz.passing_score;

    // 4. Record Attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        quiz_id: quizId,
        score,
        is_passed: passed,
        violations_count: violations,
        attempted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (attemptError) throw attemptError;

    // 5. Reward if passed and not flagged
    if (passed && !isFlagged) {
        await supabase.rpc('award_user_reward', {
          p_user_id: userId,
          p_xp_amount: quiz.xp_reward || 100,
          p_sp_amount: 5.0, // Bonus SP for passing quiz
          p_description: `Passed quiz: ${quiz.title}`
        });

        // Trigger Notification
        await supabase.from('notifications').insert({
            user_id: userId,
            type: 'REWARD',
            title: 'Quiz Master!',
            message: `You passed '${quiz.title}' with ${score}% and earned 5 SP!`
        });
    }

    res.status(200).json({
      success: true,
      data: {
        score,
        passed,
        is_flagged: isFlagged,
        attempt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get user's previous quiz results
 * @route   GET /api/v1/quizzes/:id/results
 */
export const getQuizResults = async (req, res, next) => {
  try {
    const { id: quizId } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('user_id', userId)
      .order('attempted_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

