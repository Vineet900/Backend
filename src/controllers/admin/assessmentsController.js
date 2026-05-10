import { adminSupabase } from '../../config/supabase.js'

export const getAssessments = async (req, res) => {
  try {
    if (!adminSupabase) return res.json({ success: true, data: [] })
    const { data, error } = await adminSupabase.from('assessments').select('*').order('created_at', { ascending: false })
    if (error) throw error
    res.json({ success: true, message: "Assessments fetched", data })
  } catch (error) {
    res.json({ success: true, data: [] })
  }
}

export const createAssessment = async (req, res) => {
  try {
    if (!adminSupabase) return res.json({ success: true, data: { id: Date.now(), ...req.body } })
    const { data, error } = await adminSupabase.from('assessments').insert([req.body]).select().single()
    if (error) throw error
    res.json({ success: true, message: "Assessment created", data })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}
