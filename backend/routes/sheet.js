const express = require('express')
const {
  uid,
  normalizeDifficulty,
  arrayMove,
  getDb,
  writeData,
} = require('../store')

const router = express.Router()

router.get('/sheet', (_req, res) => {
  res.json(getDb())
})

router.post('/topics', (req, res) => {
  const db = getDb()
  const name = req.body?.name?.trim()
  if (!name) return res.status(400).json({ error: 'Name required' })
  const topic = { id: uid(), name, subTopics: [] }
  db.topics.push(topic)
  writeData(db)
  res.json(topic)
})

router.put('/topics/:id', (req, res) => {
  const db = getDb()
  const name = req.body?.name?.trim()
  const topic = db.topics.find((t) => t.id === req.params.id)
  if (!topic) return res.status(404).json({ error: 'Not found' })
  topic.name = name || topic.name
  writeData(db)
  res.json(topic)
})

router.delete('/topics/:id', (req, res) => {
  const db = getDb()
  const idx = db.topics.findIndex((t) => t.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  db.topics.splice(idx, 1)
  writeData(db)
  res.json({ ok: true })
})

router.post('/topics/:topicId/subtopics', (req, res) => {
  const db = getDb()
  const topic = db.topics.find((t) => t.id === req.params.topicId)
  if (!topic) return res.status(404).json({ error: 'Topic not found' })
  const name = req.body?.name?.trim()
  if (!name) return res.status(400).json({ error: 'Name required' })
  const sub = { id: uid(), name, questions: [] }
  topic.subTopics.push(sub)
  writeData(db)
  res.json(sub)
})

router.put('/topics/:topicId/subtopics/:subId', (req, res) => {
  const db = getDb()
  const topic = db.topics.find((t) => t.id === req.params.topicId)
  if (!topic) return res.status(404).json({ error: 'Topic not found' })
  const sub = topic.subTopics.find((s) => s.id === req.params.subId)
  if (!sub) return res.status(404).json({ error: 'Sub-topic not found' })
  sub.name = req.body?.name?.trim() || sub.name
  writeData(db)
  res.json(sub)
})

router.delete('/topics/:topicId/subtopics/:subId', (req, res) => {
  const db = getDb()
  const topic = db.topics.find((t) => t.id === req.params.topicId)
  if (!topic) return res.status(404).json({ error: 'Topic not found' })
  const idx = topic.subTopics.findIndex((s) => s.id === req.params.subId)
  if (idx === -1) return res.status(404).json({ error: 'Sub-topic not found' })
  topic.subTopics.splice(idx, 1)
  writeData(db)
  res.json({ ok: true })
})

router.post('/topics/:topicId/subtopics/:subId/questions', (req, res) => {
  const db = getDb()
  const topic = db.topics.find((t) => t.id === req.params.topicId)
  if (!topic) return res.status(404).json({ error: 'Topic not found' })
  const sub = topic.subTopics.find((s) => s.id === req.params.subId)
  if (!sub) return res.status(404).json({ error: 'Sub-topic not found' })
  const { title, difficulty = 'Medium', resource = '', problemUrl = '' } = req.body || {}
  if (!title?.trim()) return res.status(400).json({ error: 'Title required' })
  const q = {
    id: uid(),
    title: title.trim(),
    difficulty: normalizeDifficulty(difficulty),
    resource,
    problemUrl,
    isSolved: false,
  }
  sub.questions.push(q)
  writeData(db)
  res.json(q)
})

router.put('/topics/:topicId/subtopics/:subId/questions/:qid', (req, res) => {
  const db = getDb()
  const topic = db.topics.find((t) => t.id === req.params.topicId)
  if (!topic) return res.status(404).json({ error: 'Topic not found' })
  const sub = topic.subTopics.find((s) => s.id === req.params.subId)
  if (!sub) return res.status(404).json({ error: 'Sub-topic not found' })
  const q = sub.questions.find((x) => x.id === req.params.qid)
  if (!q) return res.status(404).json({ error: 'Question not found' })
  const { title, difficulty, resource, problemUrl, isSolved } = req.body || {}
  if (title) q.title = title
  if (difficulty) q.difficulty = normalizeDifficulty(difficulty)
  if (resource !== undefined) q.resource = resource
  if (problemUrl !== undefined) q.problemUrl = problemUrl
  if (isSolved !== undefined) q.isSolved = Boolean(isSolved)
  writeData(db)
  res.json(q)
})

router.delete('/topics/:topicId/subtopics/:subId/questions/:qid', (req, res) => {
  const db = getDb()
  const topic = db.topics.find((t) => t.id === req.params.topicId)
  if (!topic) return res.status(404).json({ error: 'Topic not found' })
  const sub = topic.subTopics.find((s) => s.id === req.params.subId)
  if (!sub) return res.status(404).json({ error: 'Sub-topic not found' })
  const idx = sub.questions.findIndex((q) => q.id === req.params.qid)
  if (idx === -1) return res.status(404).json({ error: 'Question not found' })
  sub.questions.splice(idx, 1)
  writeData(db)
  res.json({ ok: true })
})

router.patch('/topics/:topicId/subtopics/:subId/questions/:qid/toggle', (req, res) => {
  const db = getDb()
  const topic = db.topics.find((t) => t.id === req.params.topicId)
  if (!topic) return res.status(404).json({ error: 'Topic not found' })
  const sub = topic.subTopics.find((s) => s.id === req.params.subId)
  if (!sub) return res.status(404).json({ error: 'Sub-topic not found' })
  const q = sub.questions.find((x) => x.id === req.params.qid)
  if (!q) return res.status(404).json({ error: 'Question not found' })
  q.isSolved = !q.isSolved
  writeData(db)
  res.json(q)
})

router.post('/reorder/topics', (req, res) => {
  const db = getDb()
  const { activeId, overId } = req.body || {}
  const oldIndex = db.topics.findIndex((t) => t.id === activeId)
  const newIndex = db.topics.findIndex((t) => t.id === overId)
  if (oldIndex === -1 || newIndex === -1) return res.status(400).json({ error: 'Invalid ids' })
  db.topics = arrayMove(db.topics, oldIndex, newIndex)
  writeData(db)
  res.json({ topics: db.topics })
})

router.post('/reorder/subtopics', (req, res) => {
  const db = getDb()
  const { topicId, activeId, overId } = req.body || {}
  const topic = db.topics.find((t) => t.id === topicId)
  if (!topic) return res.status(404).json({ error: 'Topic not found' })
  const oldIndex = topic.subTopics.findIndex((s) => s.id === activeId)
  const newIndex = topic.subTopics.findIndex((s) => s.id === overId)
  if (oldIndex === -1 || newIndex === -1) return res.status(400).json({ error: 'Invalid ids' })
  topic.subTopics = arrayMove(topic.subTopics, oldIndex, newIndex)
  writeData(db)
  res.json({ subTopics: topic.subTopics })
})

router.post('/reorder/questions', (req, res) => {
  const db = getDb()
  const { topicId, subId, activeId, overId } = req.body || {}
  const topic = db.topics.find((t) => t.id === topicId)
  if (!topic) return res.status(404).json({ error: 'Topic not found' })
  const sub = topic.subTopics.find((s) => s.id === subId)
  if (!sub) return res.status(404).json({ error: 'Sub-topic not found' })
  const oldIndex = sub.questions.findIndex((q) => q.id === activeId)
  const newIndex = sub.questions.findIndex((q) => q.id === overId)
  if (oldIndex === -1 || newIndex === -1) return res.status(400).json({ error: 'Invalid ids' })
  sub.questions = arrayMove(sub.questions, oldIndex, newIndex)
  writeData(db)
  res.json({ questions: sub.questions })
})

module.exports = router
