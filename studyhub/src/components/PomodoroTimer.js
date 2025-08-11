import React, { useEffect, useRef, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1/pomodoro';

export default function PomodoroTimer() {
  const [mode, setMode] = useState('work'); // 'work' | 'short' | 'long'
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState([]);
  const intervalRef = useRef(null);
  const startRef = useRef(null);

  // Load sessions from backend
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setSessions(data))
      .catch(err => console.error('Failed to load sessions:', err));
  }, []);

  // Set default time when mode changes
  useEffect(() => {
    const durations = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
    setTimeLeft(durations[mode]);
    setRunning(false);
    clearInterval(intervalRef.current);
  }, [mode]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);

          const end = new Date();
          const start = startRef.current || new Date(Date.now() - (mode === 'work' ? 25 * 60 * 1000 : mode === 'short' ? 5 * 60 * 1000 : 15 * 60 * 1000));
          const newSession = { mode, start: start.toISOString(), end: end.toISOString() };

          // Save session to backend
          fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSession),
          })
            .then(res => {
              if (!res.ok) throw new Error('Failed to save session');
              return res.json();
            })
            .then(savedSession => {
              setSessions(s => [savedSession, ...s].slice(0, 50));
            })
            .catch(err => console.error(err));

          // Auto switch mode
          setMode((prevMode) => (prevMode === 'work' ? 'short' : 'work'));

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  function startPause() {
    if (running) {
      setRunning(false);
      clearInterval(intervalRef.current);
    } else {
      startRef.current = new Date();
      setRunning(true);
    }
  }

  function reset() {
    const durations = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
    setTimeLeft(durations[mode]);
    setRunning(false);
    clearInterval(intervalRef.current);
  }

  function format(t) {
    const m = Math.floor(t / 60).toString().padStart(2, '0');
    const s = (t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function clearSessions() {
    if (!window.confirm('Clear pomodoro history?')) return;

    fetch(API_URL, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to clear sessions');
        setSessions([]);
      })
      .catch(err => console.error(err));
  }

  return (
    <div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, fontWeight: 700, fontFamily: 'monospace' }}>{format(timeLeft)}</div>

        <div className="pomodoro-controls" style={{ marginTop: '1rem' }}>
          <button onClick={startPause}>{running ? 'Pause' : 'Start'}</button>
          <button onClick={reset}>Reset</button>
        </div>

        <div className="pomodoro-controls" style={{ marginTop: '1rem' }}>
          <button onClick={() => setMode('work')} style={{ fontWeight: mode === 'work' ? 'bold' : 'normal' }}>
            Work
          </button>
          <button onClick={() => setMode('short')} style={{ fontWeight: mode === 'short' ? 'bold' : 'normal' }}>
            Short
          </button>
          <button onClick={() => setMode('long')} style={{ fontWeight: mode === 'long' ? 'bold' : 'normal' }}>
            Long
          </button>
        </div>
      </div>

      <div className="pomodoro-controls" style={{ marginTop: '1rem' }}>
        <div className="flex justify-between items-center">
          <div className="h3">Session history</div>
          <div>
            <button className="small" onClick={clearSessions}>
              Clear
            </button>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="muted mt-2">No sessions logged yet.</div>
        ) : (
          <div className="mt-2">
            {sessions.map((s) => (
              <div key={s._id || s.id} className="list-item" style={{ alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {s.mode === 'work' ? 'Work' : s.mode === 'short' ? 'Short Break' : 'Long Break'}
                  </div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    From {new Date(s.start).toLocaleString()} to {new Date(s.end).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
