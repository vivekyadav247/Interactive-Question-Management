const express = require('express')
const fs = require('fs')
const path = require('path')

const router = express.Router()
const SHEET_PATH = path.join(__dirname, '..', 'sheet.json')

const loadSheet = () => {
  try {
    const raw = fs.readFileSync(SHEET_PATH, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    console.error('Failed to read sheet.json', err)
    return null
  }
}

router.get('/sheet', (_req, res) => {
  const data = loadSheet()
  if (!data) return res.status(500).json({ error: 'Sheet not available' })
  res.json(data)
})

module.exports = router
