import React, { useEffect, useState, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// For export to PDF
import jsPDF from 'jspdf';

// Helper to convert HTML to Markdown (simple lib)
import TurndownService from 'turndown';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1/notes';
const API_NOTEBOOKS_URL = process.env.REACT_APP_API_URL_NOTEBOOKS || 'http://localhost:5000/api/v1/notebooks';

export default function Notes({ compact = false }) {
  const [notes, setNotes] = useState([]);
  const [notebooks, setNotebooks] = useState([]);
  const [selectedNotebookId, setSelectedNotebookId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]); // tags as array of strings
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch notes & notebooks on mount
  useEffect(() => {
    fetchNotebooks();
    fetchNotes();
  }, []);

  // Fetch notebooks
  const fetchNotebooks = useCallback(() => {
    fetch(API_NOTEBOOKS_URL)
      .then(res => res.json())
      .then(data => setNotebooks(data))
      .catch(err => console.error('Failed to fetch notebooks', err));
  }, []);

  // Fetch notes
  const fetchNotes = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch notes');
        return res.json();
      })
      .then(data => {
        setNotes(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Create or update note
  function createOrUpdate(e) {
    e?.preventDefault();
    if (!content.trim() && !title.trim()) return;

    const payload = {
      title: title.trim() || 'Untitled',
      content, // HTML from Quill
      tags,
      notebookId: selectedNotebookId || null,
    };

    const url = editingId ? `${API_URL}/${editingId}` : API_URL;
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to save note');
        return res.json();
      })
      .then(note => {
        if (editingId) {
          setNotes(notes.map(n => (n._id === editingId ? note : n)));
        } else {
          setNotes([note, ...notes]);
        }
        resetForm();
      })
      .catch(err => {
        setError(err.message);
      });
  }

  function resetForm() {
    setEditingId(null);
    setTitle('');
    setContent('');
    setTags([]);
    setSelectedNotebookId('');
  }

  // Set form for editing note
  function edit(note) {
    setEditingId(note._id);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags || []);
    setSelectedNotebookId(note.notebookId || '');
  }

  // Delete note
  function del(id) {
    if (!window.confirm('Delete this note?')) return;
    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete note');
        setNotes(notes.filter(n => n._id !== id));
      })
      .catch(err => setError(err.message));
  }

  // Tag input handler (comma separated)
  function onTagsChange(e) {
    const input = e.target.value;
    const tagList = input.split(',').map(t => t.trim()).filter(Boolean);
    setTags(tagList);
  }

  // Filter notes by search query and notebook
  const filteredNotes = notes.filter(n => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      n.title.toLowerCase().includes(q) ||
      (n.content && n.content.toLowerCase().includes(q)) ||
      (n.tags && n.tags.some(tag => tag.toLowerCase().includes(q)));

    const matchesNotebook = selectedNotebookId ? n.notebookId === selectedNotebookId : true;

    return matchesSearch && matchesNotebook;
  });

  // Export note to PDF
  function exportNoteToPDF(note) {
    const doc = new jsPDF();
    doc.text(note.title, 10, 10);
    // For content, strip HTML tags for simplicity (or render HTML as text)
    const div = document.createElement('div');
    div.innerHTML = note.content || '';
    const text = div.textContent || div.innerText || '';
    doc.text(text, 10, 20);
    doc.save(`${note.title || 'note'}.pdf`);
  }

  // Export note to Markdown (basic HTML -> Markdown conversion)
  function exportNoteToMarkdown(note) {
    const turndownService = new TurndownService();
    const markdown = turndownService.turndown(note.content || '');
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title || 'note'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import notes from Markdown files
  function importNotes(event) {
    const files = event.target.files;
    if (!files.length) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = e => {
      const markdownText = e.target.result;
      // Convert markdown to HTML (simple)
      // You could use a library like marked (npm install marked) for better conversion
      // For now, just wrap in <pre> tag as placeholder
      const htmlContent = `<pre>${markdownText}</pre>`;

      // Create note with imported content
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: file.name, content: htmlContent }),
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to import note');
          return res.json();
        })
        .then(newNote => {
          setNotes([newNote, ...notes]);
        })
        .catch(err => setError(err.message));
    };

    reader.readAsText(file);
  }

  // Limit notes in compact mode
  const visibleNotes = compact ? filteredNotes.slice(0, 3) : filteredNotes;

  if (loading) return <div>Loading notes...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      {!compact && (
        <>
          {/* Search input */}
          <input
            className="input mb-2"
            type="text"
            placeholder="Search notes and tags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ marginBottom: 12 }}
          />

          {/* Notebook filter */}
          <select
            className="input mb-2"
            value={selectedNotebookId}
            onChange={e => setSelectedNotebookId(e.target.value)}
          >
            <option value="">All Notebooks</option>
            {notebooks.map(nb => (
              <option key={nb._id} value={nb._id}>
                {nb.name}
              </option>
            ))}
          </select>

          {/* Note form */}
          <form onSubmit={createOrUpdate} className="mb-4">
            <input
              className="input mb-2"
              placeholder="Note title (optional)"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              placeholder="Write note with rich text..."
              style={{ marginBottom: 12 }}
            />
            <input
              className="input mb-2"
              type="text"
              placeholder="Tags (comma separated)"
              value={tags.join(', ')}
              onChange={onTagsChange}
            />
            <select
              className="input mb-2"
              value={selectedNotebookId}
              onChange={e => setSelectedNotebookId(e.target.value)}
            >
              <option value="">Select Notebook (optional)</option>
              {notebooks.map(nb => (
                <option key={nb._id} value={nb._id}>
                  {nb.name}
                </option>
              ))}
            </select>

            <div className="pomodoro-controls" style={{ marginTop: 8 }}>
              <button className="btn" type="submit">
                {editingId ? 'Save' : 'Create'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn secondary"
                  onClick={resetForm}
                  style={{ marginLeft: 8 }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Import notes */}
          <div style={{ marginBottom: 12 }}>
            <label>
              Import note (Markdown):
              <input type="file" accept=".md,.markdown,.txt" onChange={importNotes} />
            </label>
          </div>
        </>
      )}

      {/* Notes list */}
      {visibleNotes.length === 0 ? (
        <div className="muted">No notes found.</div>
      ) : (
        <div>
          {visibleNotes.map(note => (
            <div
              key={note._id}
              className="list-item"
              style={{
                borderBottom: '1px solid #ccc',
                padding: '8px 12px',
                marginBottom: 6,
              }}
            >
              <div style={{ marginBottom: 6 }}>
                <strong>{note.title}</strong>
                <div
                  style={{ fontSize: 12, color: '#666', marginTop: 2 }}
                >
                  Notebook:{' '}
                  {notebooks.find(nb => nb._id === note.notebookId)?.name || 'None'}
                </div>
                <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: note.content }} />
                <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
                  Tags: {note.tags?.join(', ') || 'None'}
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
                  Updated: {new Date(note.updatedAt || note.createdAt).toLocaleString()}
                </div>
              </div>
              <div
                className="pomodoro-controls"
                style={{ display: 'flex', gap: 6, marginTop: 6 }}
              >
                <button
                  onClick={() => edit(note)}
                  className="btn secondary"
                  style={{ padding: '4px 8px' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => del(note._id)}
                  className="btn danger"
                  style={{
                    backgroundColor: '#e97e7e',
                    borderColor: '#ec6ce2',
                    padding: '4px 8px',
                    color: '#fff',
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={() => exportNoteToPDF(note)}
                  className="btn"
                  style={{ padding: '4px 8px' }}
                  title="Export to PDF"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => exportNoteToMarkdown(note)}
                  className="btn"
                  style={{ padding: '4px 8px' }}
                  title="Export to Markdown"
                >
                  Export MD
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
