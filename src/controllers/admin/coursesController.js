import { adminSupabase } from '../../config/supabase.js'

export const getCourses = async (req, res) => {
  try {
    if (!adminSupabase) return res.json({ success: true, data: [] })
    const { data, error } = await adminSupabase.from('courses').select('*').order('created_at', { ascending: false })
    if (error) throw error
    res.json({ success: true, message: "Courses fetched", data })
  } catch (error) {
    res.json({ success: true, data: [] })
  }
}

export const createCourse = async (req, res) => {
  try {
    if (!adminSupabase) return res.json({ success: true, data: { id: Date.now(), ...req.body } })
    const { data, error } = await adminSupabase.from('courses').insert([req.body]).select().single()
    if (error) throw error
    res.json({ success: true, message: "Course created", data })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params
    if (!adminSupabase) return res.json({ success: true, data: { id, ...req.body } })
    const { data, error } = await adminSupabase.from('courses').update(req.body).eq('id', id).select().single()
    if (error) throw error
    res.json({ success: true, message: "Course updated", data })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params
    if (!adminSupabase) return res.json({ success: true, message: "Course deleted" })
    const { error } = await adminSupabase.from('courses').delete().eq('id', id)
    if (error) throw error
    res.json({ success: true, message: "Course deleted" })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

// Lessons CRUD

export const getLessons = async (req, res) => {
  try {
    const { courseId } = req.params
    if (!adminSupabase) return res.json({ success: true, data: [] })
    
    let query = adminSupabase.from('lessons').select('*').order('chapter_number', { ascending: true })
    if (courseId && courseId !== 'all') {
      query = query.eq('course_id', courseId)
    }
    
    const { data, error } = await query
    if (error) throw error
    res.json({ success: true, message: "Lessons fetched", data })
  } catch (error) {
    res.json({ success: true, data: [] })
  }
}

export const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params
    const lessonData = { ...req.body, course_id: courseId }
    if (!adminSupabase) return res.json({ success: true, data: { id: Date.now(), ...lessonData } })
    const { data, error } = await adminSupabase.from('lessons').insert([lessonData]).select().single()
    if (error) throw error
    res.json({ success: true, message: "Lesson created", data })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

export const updateLesson = async (req, res) => {
  try {
    const { id } = req.params
    if (!adminSupabase) return res.json({ success: true, data: { id, ...req.body } })
    const { data, error } = await adminSupabase.from('lessons').update(req.body).eq('id', id).select().single()
    if (error) throw error
    res.json({ success: true, message: "Lesson updated", data })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params
    if (!adminSupabase) return res.json({ success: true, message: "Lesson deleted" })
    const { error } = await adminSupabase.from('lessons').delete().eq('id', id)
    if (error) throw error
    res.json({ success: true, message: "Lesson deleted" })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}
