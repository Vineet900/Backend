import { adminSupabase } from '../../config/supabase.js'

export const getAiSettings = async (req, res) => {
  try {
    if (!adminSupabase) return res.json({ success: true, data: { aiEnabled: true, modelSelect: 'gpt-4o-mini', maxTokens: 2000, dailyLimit: 50, strictMode: true } })
    const { data, error } = await adminSupabase.from('ai_settings').select('*').single()
    if (error) throw error
    res.json({ success: true, message: "AI Settings fetched", data })
  } catch (error) {
    res.json({ success: true, data: { aiEnabled: true, modelSelect: 'gpt-4o-mini', maxTokens: 2000, dailyLimit: 50, strictMode: true } })
  }
}

export const updateAiSettings = async (req, res) => {
  try {
    if (!adminSupabase) return res.json({ success: true, data: req.body })
    const { data, error } = await adminSupabase.from('ai_settings').upsert({ id: 1, ...req.body }).select().single()
    if (error) throw error
    res.json({ success: true, message: "AI Settings updated", data })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}
