import { supabase } from '../database/supabase.js';
import { logger } from '../utils/logger.js';

/**
 * @desc    Upload user avatar to Supabase Storage
 * @route   POST /api/uploads/avatar
 */
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const file = req.file;
    const userId = req.user.id;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `avatars/${userId}-${Date.now()}.${fileExt}`;

    // 1. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('public')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('public')
      .getPublicUrl(fileName);

    // 3. Update User Profile
    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('user_id', userId);

    res.status(200).json({ success: true, url: publicUrl });
  } catch (err) {
    logger.error('Upload Error:', err);
    next(err);
  }
};

/**
 * @desc    Upload course thumbnail (Admin Only)
 * @route   POST /api/uploads/thumbnail
 */
export const uploadThumbnail = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `courses/thumb-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('public')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('public')
      .getPublicUrl(fileName);

    res.status(200).json({ success: true, url: publicUrl });
  } catch (err) {
    next(err);
  }
};
