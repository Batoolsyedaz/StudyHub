import React, { useState } from 'react';

const gradeMap = { 'A+':4.0,'A':4.0,'A-':3.7,'B+':3.3,'B':3.0,'B-':2.7,'C+':2.3,'C':2.0,'D':1.0,'F':0 };

export default function GPACalculator({ compact = false }) {
  const [courses, setCourses] = useState([{ id: Date.now(), name: '', credits: 3, grade: 'A' }]);
  const [result, setResult] = useState(null);

  function addRow() {
    setCourses([...courses, { id: Date.now(), name: '', credits: 3, grade: 'A' }]);
  }

  function removeRow(id) {
    setCourses(courses.filter(c => c.id !== id));
  }

  function change(id, key, val) {
    setCourses(courses.map(c => c.id === id ? { ...c, [key]: key === 'credits' ? Number(val) : val } : c));
  }

  function calc(e) {
    e?.preventDefault();
    let totalPoints = 0, totalCredits = 0;
    courses.forEach(c => {
      const g = gradeMap[c.grade] ?? 0;
      const cr = Number(c.credits) || 0;
      totalPoints += g * cr;
      totalCredits += cr;
    });
    if (!totalCredits) {
      setResult('0.00');
      return;
    }
    setResult((totalPoints / totalCredits).toFixed(2));
  }

  if (compact) {
    return <div className="muted">Open GPA page for full calculator.</div>;
  }

  return (
    <div>
      <h3 className="h3">GPA Calculator</h3>
      <form onSubmit={calc}>
        {courses.map((c) => (
          <div
            key={c.id}
            className="mt-2"
            style={{ display: 'grid', gridTemplateColumns: '2fr 80px 120px 80px', gap: 8 }}
          >
            <input
              className="input"
              placeholder="Course name"
              value={c.name}
              onChange={(e) => change(c.id, 'name', e.target.value)}
            />
            <input
              className="input"
              type="number"
              min="0"
              value={c.credits}
              onChange={(e) => change(c.id, 'credits', e.target.value)}
            />
            <select
              className="input"
              value={c.grade}
              onChange={(e) => change(c.id, 'grade', e.target.value)}
            >
              {Object.keys(gradeMap).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <div className="pomodoro-controls">
              <button type="button" onClick={() => removeRow(c.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}

        <div className="pomodoro-controls" style={{ marginTop: '1rem' }}>
          <button className="btn" type="submit">
            Calculate
          </button>
          <button type="button" className="btn secondary" onClick={addRow} style={{ marginLeft: '8px' }}>
            Add Course
          </button>
        </div>
      </form>

      {result !== null && (
        <div className="mt-4 card">
          <div className="h3">Semester GPA</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{result}</div>
        </div>
      )}
    </div>
  );
}
