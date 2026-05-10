import { z } from 'zod';

export const createCourseSchema = z.object({
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  thumbnail_url: z.string().url().optional(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
  is_published: z.boolean().default(false),
});

export const updateCourseSchema = createCourseSchema.partial();

export const createSectionSchema = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(3).max(100),
  sort_order: z.number().int().nonnegative(),
});

export const createLessonSchema = z.object({
  section_id: z.string().uuid(),
  slug: z.string().min(3).max(50),
  title: z.string().min(3).max(100),
  content: z.string().optional(),
  video_url: z.string().url().optional(),
  duration_seconds: z.number().int().nonnegative().default(0),
  xp_reward: z.number().int().nonnegative().default(50),
  sort_order: z.number().int().nonnegative(),
});
