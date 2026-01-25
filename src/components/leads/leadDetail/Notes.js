import React, { useState, useEffect } from 'react';
import './Notes.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function Notes({ leadId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [leadId]);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads/${leadId}/notes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setAddingNote(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads/${leadId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newNote.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNotes([data.note, ...notes]);
        setNewNote('');
      }
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setAddingNote(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="notes-loading">Loading notes...</div>;
  }

  return (
    <div className="notes-panel">
      <div className="notes-header">
        <h2>Notes</h2>
        <span className="notes-count">{notes.length}</span>
      </div>

      <form className="notes-form" onSubmit={handleAddNote}>
        <textarea
          className="notes-textarea"
          placeholder="Add a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={4}
        />
        <button type="submit" className="notes-submit-btn" disabled={addingNote || !newNote.trim()}>
          {addingNote ? 'Adding...' : 'Add Note'}
        </button>
      </form>

      <div className="notes-list">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.id} className="note-item">
              <div className="note-content">{note.content}</div>
              <div className="note-meta">
                {formatDate(note.created_at)} · {note.user_name || 'You'}
              </div>
            </div>
          ))
        ) : (
          <div className="notes-empty">
            <p>No notes yet. Add your first note above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notes;







