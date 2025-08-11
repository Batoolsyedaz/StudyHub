import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1/tasks';

export default function TaskManager({ compact = false }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);

  // Fetch tasks from backend
  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching tasks:', err);
        setLoading(false);
      });
  }, []);

  // Add a new task to backend
  function addTask(e) {
    e?.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      title: title.trim(),
      priority,
      done: false,
      createdAt: new Date().toISOString()
    };

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to add task');
        return res.json();
      })
      .then(savedTask => {
        setTasks(prev => [savedTask, ...prev]);
        setTitle('');
        setPriority('medium');
      })
      .catch(err => console.error(err));
  }

  // Toggle done state in backend
  function toggleDone(id) {
    const task = tasks.find(t => t._id === id);
    if (!task) return;

    fetch(`${API_URL}/${id}`, {
      method: 'PATCH', // or PUT depending on backend
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !task.done }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update task');
        return res.json();
      })
      .then(updatedTask => {
        setTasks(tasks.map(t => (t._id === id ? updatedTask : t)));
      })
      .catch(err => console.error(err));
  }

  // Remove task in backend
  function removeTask(id) {
    if (!window.confirm('Delete this task?')) return;

    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete task');
        setTasks(tasks.filter(t => t._id !== id));
      })
      .catch(err => console.error(err));
  }

  return (
    <div>
      {!compact && (
        <form onSubmit={addTask} className="pomodoro-controls" style={{ marginBottom: '1rem' }}>
          <input
            className="input"
            placeholder="New task title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <select
            className="input"
            value={priority}
            onChange={e => setPriority(e.target.value)}
            style={{ width: 120 }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button className="btn" type="submit">Add</button>
        </form>
      )}

      {loading ? (
        <div className="muted">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="muted">No tasks yet — add one above.</div>
      ) : (
        <div>
          {tasks.map(task => (
            <div key={task._id} className={`task-item ${task.done ? 'done' : ''}`} style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleDone(task._id)}
                  style={{ cursor: 'pointer' }}
                />
                <div>
                  <div style={{ textDecoration: task.done ? 'line-through' : 'none', fontWeight: 600 }}>
                    {task.title}
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {task.priority} • {new Date(task.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="pomodoro-controls" style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button className="small" onClick={() => toggleDone(task._id)}>
                  {task.done ? 'Undo' : 'Done'}
                </button>
                <button
                  className="small"
                  onClick={() => removeTask(task._id)}
                  style={{ background: '#d88282ff', border: '1px solid #e27ac8ff' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
