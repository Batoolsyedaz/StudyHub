import React, { useState, useEffect } from 'react';
import './index.css';
import "./App.css";

import TaskManager from './components/TaskManager';
import Notes from './components/Notes';
import GPACalculator from './components/GPACalculator';
import PomodoroTimer from './components/PomodoroTimer';

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [quote, setQuote] = useState("");
  const [tip, setTip] = useState("");
  const [fact, setFact] = useState("");

  const tips = [
    "Use the Pomodoro Technique: 25 min focus, 5 min break.",
    "Review your notes before going to bed.",
    "Teach a concept to someone else to understand it better.",
    "Organize study material into smaller chunks.",
    "Avoid multitasking while studying."
  ];

  useEffect(() => {
    // Fetch random quote
    fetch("https://type.fit/api/quotes")
      .then(res => res.json())
      .then(data => {
        const random = data[Math.floor(Math.random() * data.length)];
        setQuote(random.text);
      })
      .catch(() => setQuote("Believe in yourself and all that you are."));

    // Fetch random fact
    fetch("https://uselessfacts.jsph.pl/random.json?language=en")
      .then(res => res.json())
      .then(data => setFact(data.text))
      .catch(() => setFact("Did you know? Honey never spoils."));

    // Pick random tip
    setTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  return (
    <>
      <header className="header">
        <div className="container flex items-center">
          <div className="brand">📚 StudyHub</div>
        </div>
      </header>

      <div className="container">
        <nav className="nav">
          <button className={tab==='dashboard' ? 'active' : ''} onClick={()=>setTab('dashboard')}>Dashboard</button>
          <button className={tab==='tasks' ? 'active' : ''} onClick={()=>setTab('tasks')}>Tasks</button>
          <button className={tab==='notes' ? 'active' : ''} onClick={()=>setTab('notes')}>Notes</button>
          <button className={tab==='gpa' ? 'active' : ''} onClick={()=>setTab('gpa')}>GPA</button>
          <button className={tab==='pomodoro' ? 'active' : ''} onClick={()=>setTab('pomodoro')}>Pomodoro</button>
        </nav>

        {tab === 'dashboard' && (
          <>
            {/* Top Banner */}
            <div className="banner">
              <h1>Welcome back 👋</h1>
              <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* Info Bar */}
            <div className="info-bar">
              <div className="info-box">
                <strong>🌟 Motivation:</strong> {quote}
              </div>
              <div className="info-box">
                <strong>💡 Tip:</strong> {tip}
              </div>
              <div className="info-box">
                <strong>📚 Fact:</strong> {fact}
              </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid cols-4 gap-6 mt-6">
              <div className="card">
                <h3>Tasks</h3>
                <p className="muted">Quick access to your tasks</p>
                <TaskManager compact />
              </div>

              <div className="card">
                <h3>Notes</h3>
                <p className="muted">Recent notes</p>
                <Notes compact />
              </div>

              <div className="card">
                <h3>Pomodoro</h3>
                <p className="muted">Start a focused session</p>
                <PomodoroTimer />
              </div>

              <div className="card">
                <h3>GPA Calculator</h3>
                <p className="muted">Calculate semester GPA</p>
                <GPACalculator compact />
              </div>
            </div>
          </>
        )}

        {tab === 'tasks' && <div className="card"><TaskManager /></div>}
        {tab === 'notes' && <div className="card"><Notes /></div>}
        {tab === 'gpa' && <div className="card"><GPACalculator /></div>}
        {tab === 'pomodoro' && <div className="card"><PomodoroTimer /></div>}
      </div>
    </>
  );
}
