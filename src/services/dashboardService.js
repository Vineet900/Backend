const hashCode = (value) =>
  String(value)
    .split('')
    .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0)

export function buildDashboardOverview({
  name = 'Learner',
  studyPoints = 0,
  streak = 0,
  accuracy = 0,
  completedChapters = 0,
  xp = 0,
  courseIds = [],
} = {}) {
  const fallbackCourseIds = courseIds.length ? courseIds : ['html', 'css', 'javascript']
  const courseSeed = `${name}:${studyPoints}:${streak}:${xp}`

  const courses = fallbackCourseIds.slice(0, 3).map((id, index) => {
    const progress = Math.min(96, Math.max(12, 35 + ((Math.abs(hashCode(`${courseSeed}:${id}`)) + index * 7) % 55)))
    const gradients = ['from-orange-500 to-amber-400', 'from-cyan-500 to-blue-500', 'from-violet-500 to-fuchsia-500']

    return {
      id,
      title: id.toUpperCase(),
      progress,
      gradient: gradients[index % gradients.length],
    }
  })

  return {
    profile: {
      name,
      level: `Level ${Math.max(1, Math.floor(xp / 120) + 1)} - Full Stack Track`,
    },
    topMenu: ['Learn', 'Practice', 'Assess', 'Strict Mode', 'Earn Rewards'],
    stats: [
      { id: 'lessons', label: 'Lessons Completed', value: `${completedChapters}`, delta: 'Synced from progress' },
      { id: 'points', label: 'Study Points', value: `${studyPoints}`, delta: 'Updated in real-time' },
      { id: 'streak', label: 'Current Streak', value: `${streak} Days`, delta: 'Keep consistency' },
      { id: 'accuracy', label: 'Accuracy', value: `${Math.max(0, Math.min(100, accuracy))}%`, delta: 'Based on assessments' },
    ],
    continueLearning: {
      title: `${courses[0]?.title || 'HTML'} Mastery Path`,
      subtitle: 'Next module is unlocked from your current progress.',
      progress: courses[0]?.progress || 45,
    },
    challenge: {
      title: 'Build a Login Form',
      subtitle: 'Ship a clean responsive auth form with validation.',
    },
    courses,
    upcomingAssessments: [
      { id: 1, title: `${courses[0]?.title || 'HTML'} Timed Assessment`, time: 'Today - 7:00 PM' },
      { id: 2, title: `${courses[1]?.title || 'CSS'} Practice Test`, time: 'Tomorrow - 6:30 PM' },
      { id: 3, title: `${courses[2]?.title || 'JAVASCRIPT'} Quiz`, time: 'This week - 8:00 PM' },
    ],
    achievements: [
      { id: 1, title: 'Focus Hero', detail: `Current streak: ${streak} days` },
      { id: 2, title: 'Points Builder', detail: `${studyPoints} points earned` },
      { id: 3, title: 'Skill Growth', detail: `${xp} XP collected` },
    ],
  }
}
