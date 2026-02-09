import { create } from 'zustand'
import { arrayMove } from '@dnd-kit/sortable'

// If VITE_API_URL is set, use it; otherwise assume same-origin backend at /api
const API_URL = import.meta.env.VITE_API_URL || ''
const STORAGE_KEY = 'sheet-cache-v1'

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

const safeParse = (value) => {
  try {
    return JSON.parse(value)
  } catch (_err) {
    return null
  }
}

const readCache = () => {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  const parsed = safeParse(raw)
  if (!parsed?.meta || !parsed?.topics) return null
  return parsed
}

const writeCache = (state) => {
  if (typeof localStorage === 'undefined') return
  const payload = { meta: state.sheetMeta, topics: state.topics }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

const clearCache = () => {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
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

export const useSheetStore = create((set, get) => {
  const persist = (mutate) => {
    set((state) => {
      const next = mutate(state)
      const meta = next.sheetMeta ?? state.sheetMeta
      return {
        ...state,
        ...next,
        sheetMeta: meta ? { ...meta, updatedAt: new Date().toISOString() } : meta,
      }
    })
    writeCache(get())
  }

  return {
    loading: true,
    sheetMeta: null,
    topics: [],
    filters: {
      query: '',
      difficulty: 'all',
    },
    error: null,

    loadSheet: async (force = false) => {
      set({ loading: true, error: null })
      try {
        const cached = !force ? readCache() : null
        if (cached) {
          set({
            sheetMeta: cached.meta,
            topics: cached.topics,
            loading: false,
          })
          return
        }

        const res = await fetch(`${API_URL}/api/sheet`)
        if (!res.ok) throw new Error('Failed to load sheet')
        const data = await res.json()
        const payload = {
          sheetMeta: data.meta,
          topics: data.topics || [],
          loading: false,
        }
        set(payload)
        writeCache(payload)
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
      const trimmed = name?.trim()
      if (!trimmed) throw new Error('Name required')
      const topic = { id: uid(), name: trimmed, subTopics: [] }
      persist((state) => ({ topics: [...state.topics, topic] }))
    },

    updateTopic: async (id, name) => {
      const trimmed = name?.trim()
      if (!trimmed) throw new Error('Name required')
      const { topics } = get()
      if (!topics.some((t) => t.id === id)) throw new Error('Topic not found')
      persist((state) => ({
        topics: state.topics.map((t) => (t.id === id ? { ...t, name: trimmed } : t)),
      }))
    },

    deleteTopic: async (id) => {
      const { topics } = get()
      if (!topics.some((t) => t.id === id)) throw new Error('Topic not found')
      persist((state) => ({ topics: state.topics.filter((t) => t.id !== id) }))
    },

    addSubTopic: async (topicId, name) => {
      const trimmed = name?.trim()
      if (!trimmed) throw new Error('Name required')
      const topic = get().topics.find((t) => t.id === topicId)
      if (!topic) throw new Error('Topic not found')
      const sub = { id: uid(), name: trimmed, questions: [] }
      persist((state) => ({
        topics: state.topics.map((t) =>
          t.id === topicId ? { ...t, subTopics: [...t.subTopics, sub] } : t),
      }))
    },

    updateSubTopic: async (topicId, subId, name) => {
      const trimmed = name?.trim()
      if (!trimmed) throw new Error('Name required')
      const topic = get().topics.find((t) => t.id === topicId)
      if (!topic) throw new Error('Topic not found')
      if (!topic.subTopics.some((s) => s.id === subId)) throw new Error('Sub-topic not found')

      persist((state) => ({
        topics: state.topics.map((t) => {
          if (t.id !== topicId) return t
          return {
            ...t,
            subTopics: t.subTopics.map((s) => (s.id === subId ? { ...s, name: trimmed } : s)),
          }
        }),
      }))
    },

    deleteSubTopic: async (topicId, subId) => {
      const topic = get().topics.find((t) => t.id === topicId)
      if (!topic) throw new Error('Topic not found')
      if (!topic.subTopics.some((s) => s.id === subId)) throw new Error('Sub-topic not found')

      persist((state) => ({
        topics: state.topics.map((t) =>
          t.id === topicId ? { ...t, subTopics: t.subTopics.filter((s) => s.id !== subId) } : t),
      }))
    },

    addQuestion: async (topicId, subId, payload) => {
      const topic = get().topics.find((t) => t.id === topicId)
      if (!topic) throw new Error('Topic not found')
      const sub = topic.subTopics.find((s) => s.id === subId)
      if (!sub) throw new Error('Sub-topic not found')
      const title = payload?.title?.trim()
      if (!title) throw new Error('Title required')

      const q = {
        id: uid(),
        title,
        difficulty: normalizeDifficulty(payload?.difficulty),
        resource: payload?.resource || '',
        problemUrl: payload?.problemUrl || '',
        isSolved: Boolean(payload?.isSolved),
      }

      persist((state) => ({
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
      const topic = get().topics.find((t) => t.id === topicId)
      if (!topic) throw new Error('Topic not found')
      const sub = topic.subTopics.find((s) => s.id === subId)
      if (!sub) throw new Error('Sub-topic not found')
      if (!sub.questions.some((q) => q.id === qId)) throw new Error('Question not found')

      persist((state) => ({
        topics: state.topics.map((t) => {
          if (t.id !== topicId) return t
          return {
            ...t,
            subTopics: t.subTopics.map((s) => {
              if (s.id !== subId) return s
              return {
                ...s,
                questions: s.questions.map((item) => {
                  if (item.id !== qId) return item
                  return {
                    ...item,
                    ...(payload?.title ? { title: payload.title } : {}),
                    ...(payload?.difficulty ? { difficulty: normalizeDifficulty(payload.difficulty) } : {}),
                    ...(payload?.resource !== undefined ? { resource: payload.resource } : {}),
                    ...(payload?.problemUrl !== undefined ? { problemUrl: payload.problemUrl } : {}),
                    ...(payload?.isSolved !== undefined ? { isSolved: Boolean(payload.isSolved) } : {}),
                  }
                }),
              }
            }),
          }
        }),
      }))
    },

    deleteQuestion: async (topicId, subId, qId) => {
      const topic = get().topics.find((t) => t.id === topicId)
      if (!topic) throw new Error('Topic not found')
      const sub = topic.subTopics.find((s) => s.id === subId)
      if (!sub) throw new Error('Sub-topic not found')
      if (!sub.questions.some((q) => q.id === qId)) throw new Error('Question not found')

      persist((state) => ({
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
      const topic = get().topics.find((t) => t.id === topicId)
      if (!topic) throw new Error('Topic not found')
      const sub = topic.subTopics.find((s) => s.id === subId)
      if (!sub) throw new Error('Sub-topic not found')
      const question = sub.questions.find((q) => q.id === qId)
      if (!question) throw new Error('Question not found')
      const nextValue = !question.isSolved

      persist((state) => ({
        topics: state.topics.map((t) => {
          if (t.id !== topicId) return t
          return {
            ...t,
            subTopics: t.subTopics.map((s) => {
              if (s.id !== subId) return s
              return {
                ...s,
                questions: s.questions.map((item) =>
                  item.id === qId ? { ...item, isSolved: nextValue } : item),
              }
            }),
          }
        }),
      }))
    },

    reorderTopics: async (activeId, overId) => {
      const topics = get().topics
      const oldIndex = topics.findIndex((t) => t.id === activeId)
      const newIndex = topics.findIndex((t) => t.id === overId)
      if (oldIndex === -1 || newIndex === -1) throw new Error('Invalid ids')

      persist(() => ({
        topics: arrayMove(topics, oldIndex, newIndex),
      }))
    },

    reorderSubTopics: async (topicId, activeId, overId) => {
      const topic = get().topics.find((t) => t.id === topicId)
      if (!topic) throw new Error('Topic not found')
      const oldIndex = topic.subTopics.findIndex((s) => s.id === activeId)
      const newIndex = topic.subTopics.findIndex((s) => s.id === overId)
      if (oldIndex === -1 || newIndex === -1) throw new Error('Invalid ids')

      persist((state) => ({
        topics: state.topics.map((t) => {
          if (t.id !== topicId) return t
          return {
            ...t,
            subTopics: arrayMove(t.subTopics, oldIndex, newIndex),
          }
        }),
      }))
    },

    reorderQuestions: async (topicId, subId, activeId, overId) => {
      const topic = get().topics.find((t) => t.id === topicId)
      if (!topic) throw new Error('Topic not found')
      const sub = topic.subTopics.find((s) => s.id === subId)
      if (!sub) throw new Error('Sub-topic not found')
      const oldIndex = sub.questions.findIndex((q) => q.id === activeId)
      const newIndex = sub.questions.findIndex((q) => q.id === overId)
      if (oldIndex === -1 || newIndex === -1) throw new Error('Invalid ids')

      persist((state) => ({
        topics: state.topics.map((t) => {
          if (t.id !== topicId) return t
          return {
            ...t,
            subTopics: t.subTopics.map((s) => {
              if (s.id !== subId) return s
              return {
                ...s,
                questions: arrayMove(s.questions, oldIndex, newIndex),
              }
            }),
          }
        }),
      }))
    },

    resetToSeed: async () => {
      clearCache()
      await get().loadSheet(true)
    },
  }
})
