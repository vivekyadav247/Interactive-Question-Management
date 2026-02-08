import { create } from 'zustand'
import { arrayMove } from '@dnd-kit/sortable'

// If VITE_API_URL is set, use it; otherwise assume same-origin backend at /api
const API_URL = import.meta.env.VITE_API_URL || ''

const uid = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const normalizeDifficulty = (raw) => {
  if (!raw) return 'Medium'
  const val = raw.toLowerCase()
  if (val === 'basic') return 'Easy'
  if (val === 'medium') return 'Medium'
  if (val === 'easy') return 'Easy'
  if (val === 'hard') return 'Hard'
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

const buildTree = (payload) => {
  const sheet = payload?.data?.sheet ?? payload?.sheet ?? {}
  const questions = payload?.data?.questions ?? payload?.questions ?? []

  const topicMap = new Map()

  questions.forEach((item) => {
    const topicName = item.topic?.trim() || 'Untitled Topic'
    const subName = item.subTopic?.trim() || 'General'

    if (!topicMap.has(topicName)) {
      topicMap.set(topicName, {
        id: uid(),
        name: topicName,
        subTopics: [],
      })
    }

    const topic = topicMap.get(topicName)
    let subTopic = topic.subTopics.find((s) => s.name === subName)
    if (!subTopic) {
      subTopic = {
        id: uid(),
        name: subName,
        questions: [],
      }
      topic.subTopics.push(subTopic)
    }

    subTopic.questions.push({
      id: item._id ?? uid(),
      title: item.title || item.questionId?.name || 'Untitled Question',
      difficulty: normalizeDifficulty(item.questionId?.difficulty),
      resource: item.resource || item.questionId?.problemUrl || '',
      problemUrl: item.questionId?.problemUrl || '',
      isSolved: Boolean(item.isSolved),
      topic: topicName,
      subTopic: subName,
    })
  })

  const topics = Array.from(topicMap.values())
  return {
    sheetMeta: {
      name: sheet.name ?? 'Question Sheet',
      description: sheet.description ?? '',
      updatedAt: sheet.updatedAt ?? sheet.createdAt ?? '',
      slug: sheet.slug ?? '',
    },
    topics,
  }
}

export const useSheetStore = create((set, get) => ({
  loading: true,
  sheetMeta: null,
  topics: [],
  filters: {
    query: '',
    difficulty: 'all',
  },
  error: null,

  loadSheet: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_URL}/api/sheet`)
      if (!res.ok) throw new Error('Failed to load sheet')
      const data = await res.json()
      set({
        sheetMeta: data.meta,
        topics: data.topics || [],
        loading: false,
      })
    } catch (err) {
      console.error(err)
      set({ error: err?.message || 'Failed to load data', loading: false })
    }
  },

  setFilters: (incoming) =>
    set((state) => ({
      filters: { ...state.filters, ...incoming },
    })),

  addTopic: async (name) => {
    const res = await fetch(`${API_URL}/api/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const topic = await res.json()
    if (!res.ok) throw new Error(topic.error || 'Failed to add topic')
    set((state) => ({ topics: [...state.topics, topic] }))
  },

  updateTopic: async (id, name) => {
    const res = await fetch(`${API_URL}/api/topics/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const topic = await res.json()
    if (!res.ok) throw new Error(topic.error || 'Failed to update topic')
    set((state) => ({
      topics: state.topics.map((t) => (t.id === id ? { ...t, name: topic.name } : t)),
    }))
  },

  deleteTopic: async (id) => {
    const res = await fetch(`${API_URL}/api/topics/${id}`, { method: 'DELETE' })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.error || 'Failed to delete topic')
    set((state) => ({ topics: state.topics.filter((t) => t.id !== id) }))
  },

  addSubTopic: async (topicId, name) => {
    const res = await fetch(`${API_URL}/api/topics/${topicId}/subtopics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const sub = await res.json()
    if (!res.ok) throw new Error(sub.error || 'Failed to add sub-topic')
    set((state) => ({
      topics: state.topics.map((t) =>
        t.id === topicId ? { ...t, subTopics: [...t.subTopics, sub] } : t),
    }))
  },

  updateSubTopic: async (topicId, subId, name) => {
    const res = await fetch(`${API_URL}/api/topics/${topicId}/subtopics/${subId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const sub = await res.json()
    if (!res.ok) throw new Error(sub.error || 'Failed to update sub-topic')
    set((state) => ({
      topics: state.topics.map((t) => {
        if (t.id !== topicId) return t
        return {
          ...t,
          subTopics: t.subTopics.map((s) => (s.id === subId ? { ...s, name: sub.name } : s)),
        }
      }),
    }))
  },

  deleteSubTopic: async (topicId, subId) => {
    const res = await fetch(`${API_URL}/api/topics/${topicId}/subtopics/${subId}`, {
      method: 'DELETE',
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.error || 'Failed to delete sub-topic')
    set((state) => ({
      topics: state.topics.map((t) =>
        t.id === topicId ? { ...t, subTopics: t.subTopics.filter((s) => s.id !== subId) } : t),
    }))
  },

  addQuestion: async (topicId, subId, payload) => {
    const res = await fetch(`${API_URL}/api/topics/${topicId}/subtopics/${subId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const q = await res.json()
    if (!res.ok) throw new Error(q.error || 'Failed to add question')
    set((state) => ({
      topics: state.topics.map((t) => {
        if (t.id !== topicId) return t
        return {
          ...t,
          subTopics: t.subTopics.map((s) =>
            s.id === subId ? { ...s, questions: [...s.questions, q] } : s),
        }
      }),
    }))
  },

  updateQuestion: async (topicId, subId, qId, payload) => {
    const res = await fetch(`${API_URL}/api/topics/${topicId}/subtopics/${subId}/questions/${qId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const q = await res.json()
    if (!res.ok) throw new Error(q.error || 'Failed to update question')
    set((state) => ({
      topics: state.topics.map((t) => {
        if (t.id !== topicId) return t
        return {
          ...t,
          subTopics: t.subTopics.map((s) => {
            if (s.id !== subId) return s
            return {
              ...s,
              questions: s.questions.map((item) => (item.id === qId ? { ...item, ...q } : item)),
            }
          }),
        }
      }),
    }))
  },

  deleteQuestion: async (topicId, subId, qId) => {
    const res = await fetch(`${API_URL}/api/topics/${topicId}/subtopics/${subId}/questions/${qId}`, {
      method: 'DELETE',
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.error || 'Failed to delete question')
    set((state) => ({
      topics: state.topics.map((t) => {
        if (t.id !== topicId) return t
        return {
          ...t,
          subTopics: t.subTopics.map((s) =>
            s.id === subId ? { ...s, questions: s.questions.filter((q) => q.id !== qId) } : s),
        }
      }),
    }))
  },

  toggleSolved: async (topicId, subId, qId) => {
    const res = await fetch(`${API_URL}/api/topics/${topicId}/subtopics/${subId}/questions/${qId}/toggle`, {
      method: 'PATCH',
    })
    const q = await res.json()
    if (!res.ok) throw new Error(q.error || 'Failed to toggle question')
    set((state) => ({
      topics: state.topics.map((t) => {
        if (t.id !== topicId) return t
        return {
          ...t,
          subTopics: t.subTopics.map((s) => {
            if (s.id !== subId) return s
            return {
              ...s,
              questions: s.questions.map((item) =>
                item.id === qId ? { ...item, isSolved: q.isSolved } : item),
            }
          }),
        }
      }),
    }))
  },

  reorderTopics: async (activeId, overId) => {
    await fetch(`${API_URL}/api/reorder/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activeId, overId }),
    })
    set((state) => {
      const current = [...state.topics]
      const oldIndex = current.findIndex((t) => t.id === activeId)
      const newIndex = current.findIndex((t) => t.id === overId)
      if (oldIndex === -1 || newIndex === -1) return {}
      return { topics: arrayMove(current, oldIndex, newIndex) }
    })
  },

  reorderSubTopics: async (topicId, activeId, overId) => {
    await fetch(`${API_URL}/api/reorder/subtopics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId, activeId, overId }),
    })
    set((state) => ({
      topics: state.topics.map((t) => {
        if (t.id !== topicId) return t
        const oldIndex = t.subTopics.findIndex((s) => s.id === activeId)
        const newIndex = t.subTopics.findIndex((s) => s.id === overId)
        if (oldIndex === -1 || newIndex === -1) return t
        return {
          ...t,
          subTopics: arrayMove(t.subTopics, oldIndex, newIndex),
        }
      }),
    }))
  },

  reorderQuestions: async (topicId, subId, activeId, overId) => {
    await fetch(`${API_URL}/api/reorder/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId, subId, activeId, overId }),
    })
    set((state) => ({
      topics: state.topics.map((t) => {
        if (t.id !== topicId) return t
        return {
          ...t,
          subTopics: t.subTopics.map((s) => {
            if (s.id !== subId) return s
            const oldIndex = s.questions.findIndex((q) => q.id === activeId)
            const newIndex = s.questions.findIndex((q) => q.id === overId)
            if (oldIndex === -1 || newIndex === -1) return s
            return {
              ...s,
              questions: arrayMove(s.questions, oldIndex, newIndex),
            }
          }),
        }
      }),
    }))
  },
}))
