import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import pg from 'pg'

const { Pool } = pg
const app = express()
const port = process.env.PORT || 5000
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/todos' })

app.use(cors())
app.use(express.json())

async function initializeDatabase() {
  await pool.query('CREATE TABLE IF NOT EXISTS tasks (id SERIAL PRIMARY KEY, title TEXT NOT NULL, completed BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())')
}

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }))
app.get('/api/tasks', async (_request, response) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY completed ASC, created_at DESC')
    response.json(result.rows)
  } catch (error) { response.status(500).json({ error: error.message }) }
})
app.post('/api/tasks', async (request, response) => {
  const title = request.body.title?.trim()
  if (!title) return response.status(400).json({ error: 'Title is required' })
  try {
    const result = await pool.query('INSERT INTO tasks (title) VALUES ($1) RETURNING *', [title])
    response.status(201).json(result.rows[0])
  } catch (error) { response.status(500).json({ error: error.message }) }
})
app.patch('/api/tasks/:id', async (request, response) => {
  try {
    const result = await pool.query('UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *', [request.body.completed, request.params.id])
    if (!result.rowCount) return response.status(404).json({ error: 'Task not found' })
    response.json(result.rows[0])
  } catch (error) { response.status(500).json({ error: error.message }) }
})
app.delete('/api/tasks/:id', async (request, response) => {
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1', [request.params.id])
    if (!result.rowCount) return response.status(404).json({ error: 'Task not found' })
    response.status(204).end()
  } catch (error) { response.status(500).json({ error: error.message }) }
})

initializeDatabase().then(() => app.listen(port, () => console.log(`API listening on port ${port}`))).catch((error) => {
  console.error('Database initialization failed:', error.message)
  if (error.code === '28P01') {
    console.error('Check DATABASE_URL in server/.env. For Docker Compose, use postgres://postgres:postgres@db:5432/todos.')
  }
  process.exit(1)
})
