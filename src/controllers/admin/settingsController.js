import { adminSupabase } from '../../config/supabase.js'

export const getSettings = async (req, res) => {
  try {
    if (!adminSupabase) return res.json({ success: true, data: { siteName: 'DevSchool Pro', maintenanceMode: false } })
    const { data, error } = await adminSupabase.from('app_settings').select('*').single()
    if (error) throw error
    res.json({ success: true, message: "Settings fetched", data })
  } catch (error) {
    res.json({ success: true, data: { siteName: 'DevSchool Pro', maintenanceMode: false, registrationEnabled: true, emailNotifications: true, supportEmail: 'support@devschool.com' } })
  }
}

export const updateSettings = async (req, res) => {
  try {
    if (!adminSupabase) return res.json({ success: true, data: req.body })
    // Assume id 1 or similar for global settings
    const { data, error } = await adminSupabase.from('app_settings').upsert({ id: 1, ...req.body }).select().single()
    if (error) throw error
    res.json({ success: true, message: "Settings updated", data })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}
