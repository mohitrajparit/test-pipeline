import { useEffect, useMemo, useState } from 'react'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => {
    fetch(`${apiUrl}/tasks`).then((response) => {
      if (!response.ok) throw new Error('Could not load tasks')
      return response.json()
    }).then(setTasks).catch((loadError) => setError(loadError.message)).finally(() => setLoading(false))
  }, [apiUrl])

  const visibleTasks = useMemo(() => {
    if (filter === 'active') return tasks.filter((task) => !task.completed)
    if (filter === 'completed') return tasks.filter((task) => task.completed)
    return tasks
  }, [filter, tasks])
  const completedCount = tasks.filter((task) => task.completed).length

  async function addTask(event) {
    event.preventDefault()
    const title = newTask.trim()
    if (!title) return
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`${apiUrl}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) })
      if (!response.ok) throw new Error('Could not add task')
      const createdTask = await response.json()
      setTasks((current) => [createdTask, ...current])
      setNewTask('')
    } catch (saveError) { setError(saveError.message) } finally { setSaving(false) }
  }

  async function toggleTask(task) {
    const response = await fetch(`${apiUrl}/tasks/${task.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: !task.completed }) })
    if (!response.ok) return setError('Could not update task')
    const updated = await response.json()
    setTasks((current) => current.map((item) => item.id === updated.id ? updated : item))
  }

  async function deleteTask(id) {
    const response = await fetch(`${apiUrl}/tasks/${id}`, { method: 'DELETE' })
    if (!response.ok) return setError('Could not delete task')
    setTasks((current) => current.filter((task) => task.id !== id))
  }

  return (
    <main className="app-shell">
      <header className="topbar"><span className="brand-mark">✓</span><span>daylist</span><span className="status-dot" /><small>personal workspace</small></header>
      <section className="intro"><p className="eyebrow">WEDNESDAY / SEPTEMBER 02</p><h1>Make room for<br /><em>what matters.</em></h1><p className="subtitle">A quiet place for the things you want to get done.</p></section>
      <section className="workspace">
        <div className="summary"><div><span className="summary-number">{tasks.length - completedCount}</span><span className="summary-label">open tasks</span></div><div className="progress"><span style={{ width: tasks.length ? `${(completedCount / tasks.length) * 100}%` : '0%' }} /></div><span className="summary-label">{completedCount} of {tasks.length} complete</span></div>
        <form className="add-form" onSubmit={addTask}><input aria-label="New task" value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="What needs your attention?" /><button type="submit" disabled={saving}>{saving ? 'Adding...' : 'Add task'} <span>↗</span></button></form>
        <div className="toolbar"><div className="filters">{['all', 'active', 'completed'].map((option) => <button className={filter === option ? 'selected' : ''} key={option} type="button" onClick={() => setFilter(option)}>{option}</button>)}</div><span className="task-count">{visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}</span></div>
        {error && <p className="error">{error}</p>}
        <div className="task-list">{loading ? <p className="empty-state">Loading your list...</p> : visibleTasks.length === 0 ? <p className="empty-state">Nothing here yet. Add the first small thing.</p> : visibleTasks.map((task) => <article className={`task ${task.completed ? 'done' : ''}`} key={task.id}><button className="check" type="button" aria-label={`Mark ${task.title} ${task.completed ? 'active' : 'complete'}`} onClick={() => toggleTask(task)}>{task.completed ? '✓' : ''}</button><span className="task-title">{task.title}</span><span className="task-date">{new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span><button className="delete" type="button" aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task.id)}>×</button></article>)}</div>
      </section>
      <footer>Built for focus <span>·</span> {tasks.length} total {tasks.length === 1 ? 'item' : 'items'}</footer>
    </main>
  )
}

export default App
