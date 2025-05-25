const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose()
const { v4: uuidv4 } = require('uuid')

const app = express()
app.use(cors())
app.use(bodyParser.json())

// База
const db = new sqlite3.Database(':memory:')

db.serialize(() => {
  db.run(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      full_name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      referral_code TEXT UNIQUE,
      referred_by TEXT,
      invited_count INTEGER DEFAULT 0
    )
  `)
})

// Регистрация
app.post('/register', (req, res) => {
  const { fullName, email, password, referred_by } = req.body
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' })
  }
  const id = uuidv4()
  const referral_code = Math.random().toString(36).substring(2, 10)

  // Добавляем пользователя
  db.run(
    `INSERT INTO users (id, full_name, email, password, referral_code, referred_by) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, fullName, email, password, referral_code, referred_by || null],
    function (err) {
      if (err) {
        return res.status(400).json({ error: 'Email already exists' })
      }

      // Если есть кто пригласил, увеличиваем счетчик приглашений
      if (referred_by) {
        db.run(
          `UPDATE users SET invited_count = invited_count + 1 WHERE referral_code = ?`,
          [referred_by]
        )
      }

      res.json({ id, referral_code })
    }
  )
})

// Получить сколько приглашено друзей
app.get('/invited/:referral_code', (req, res) => {
  const referral_code = req.params.referral_code
  db.get(
    `SELECT invited_count FROM users WHERE referral_code = ?`,
    [referral_code],
    (err, row) => {
      if (err || !row) return res.json({ invited_count: 0 })
      res.json({ invited_count: row.invited_count })
    }
  )
})

// Запуск сервера
const PORT = 4000
app.listen(PORT, () => {
  console.log('Server running on port', PORT)
})