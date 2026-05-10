import { adminSupabase } from '../../config/supabase.js'

export const getQuizzes = async (req, res) => {
  try {
    if (!adminSupabase) return res.json({ success: true, data: [] })
    const { data, error } = await adminSupabase.from('quizzes').select('*').order('created_at', { ascending: false })
    if (error) throw error
    res.json({ success: true, message: "Quizzes fetched", data })
  } catch (error) {
    res.json({ success: true, data: [] })
  }
}

export const createQuiz = async (req, res) => {
  try {
    if (!adminSupabase) return res.json({ success: true, data: { id: Date.now(), ...req.body } })
    const { data, error } = await adminSupabase.from('quizzes').insert([req.body]).select().single()
    if (error) throw error
    res.json({ success: true, message: "Quiz created", data })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params
    if (!adminSupabase) return res.json({ success: true, data: { id, ...req.body } })
    const { data, error } = await adminSupabase.from('quizzes').update(req.body).eq('id', id).select().single()
    if (error) throw error
    res.json({ success: true, message: "Quiz updated", data })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params
    if (!adminSupabase) return res.json({ success: true, message: "Quiz deleted" })
    const { error } = await adminSupabase.from('quizzes').delete().eq('id', id)
    if (error) throw error
    res.json({ success: true, message: "Quiz deleted" })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}
