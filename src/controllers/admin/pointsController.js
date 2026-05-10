import { adminSupabase } from '../../config/supabase.js'

export const getPointsTransactions = async (req, res) => {
  try {
    if (!adminSupabase) return res.json({ success: true, data: [] })
    const { data, error } = await adminSupabase.from('study_points_log').select('*, profiles(name)').order('created_at', { ascending: false }).limit(50)
    if (error) throw error
    res.json({ success: true, message: "Transactions fetched", data })
  } catch (error) {
    res.json({ success: true, data: [] })
  }
}

export const adjustPoints = async (req, res) => {
  try {
    const { userId, amount, reason, type } = req.body
    if (!adminSupabase) return res.json({ success: true, data: { id: Date.now(), userId, amount, type, reason } })
    
    // In real app, run a transaction to update user profile and insert log
    const { data, error } = await adminSupabase.from('study_points_log').insert([{ user_id: userId, amount, type, reason }]).select().single()
    if (error) throw error
    res.json({ success: true, message: "Points adjusted", data })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}
