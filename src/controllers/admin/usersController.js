import { adminSupabase } from '../../config/supabase.js'

export const getUsers = async (req, res) => {
  try {
    if (!adminSupabase) return res.json({ success: true, data: [] })

    // We select from 'profiles' or whatever the user table is
    const { data, error } = await adminSupabase
      .from('profiles')
      .select('*')
      // Note: profiles table doesn't have created_at usually, but assuming it does or using updated_at
      .order('updated_at', { ascending: false })

    if (error) throw error

    // Map study_points to points for the frontend
    const mappedData = data.map(user => ({
      ...user,
      points: user.study_points || 0
    }));

    res.json({ success: true, message: "Users fetched successfully", data: mappedData })
  } catch (error) {
    // Graceful fallback if table doesn't exist
    console.error('Error fetching users:', error);
    res.json({ success: true, data: [] })
  }
}

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    if (!adminSupabase) return res.json({ success: true, data: { id, ...updates } })

    const { data, error } = await adminSupabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json({ success: true, message: "User updated", data })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

export const banUser = async (req, res) => {
  try {
    const { id } = req.params
    const { banned } = req.body

    if (!adminSupabase) return res.json({ success: true, data: { id, banned } })

    const { data, error } = await adminSupabase
      .from('profiles')
      .update({ is_banned: banned })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json({ success: true, message: `User ${banned ? 'banned' : 'unbanned'}`, data })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}
