export const badgeColors = {
  Easy: 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30',
  Medium: 'bg-amber-500/15 text-amber-200 border border-amber-400/30',
  Hard: 'bg-rose-500/15 text-rose-200 border border-rose-400/30',
}

export const difficultyOrder = ['Easy', 'Medium', 'Hard']

export const hostLabel = (url) => {
  if (!url) return 'Link'
  try {
    const host = new URL(url).hostname.toLowerCase()
    if (host.includes('geeksforgeeks')) return 'GFG'
    if (host.includes('leetcode')) return 'LeetCode'
    if (host.includes('code360') || host.includes('naukri')) return 'Code360'
    if (host.includes('youtube')) return 'YouTube'
    if (host.includes('github')) return 'GitHub'
    return host.replace(/^www\./, '')
  } catch {
    return 'Link'
  }
}

export const formatDate = (iso) => {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}
