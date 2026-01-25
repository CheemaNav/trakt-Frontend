import React, { useState, useEffect } from 'react';
import './Notes.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function Notes({ leadId, onNotesChange }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [leadId]);

  // Refresh notes periodically (every 5 seconds) to keep them dynamic
  useEffect(() => {
    if (!leadId) return;
    
    const interval = setInterval(() => {
      fetchNotes();
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/leads/${leadId}/notes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const fetchedNotes = data.notes || [];
        setNotes(fetchedNotes);
        // Notify parent component about the updated notes
        if (onNotesChange) {
          onNotesChange(fetchedNotes);
        }
      } else if (response.status === 404) {
        // Lead not found or no notes yet - set empty array
        setNotes([]);
        if (onNotesChange) {
          onNotesChange([]);
        }
      } else {
        console.error('Error fetching notes:', response.status, response.statusText);
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
        const updatedNotes = [data.note, ...notes];
        setNotes(updatedNotes);
        setNewNote('');
        // Notify parent component about the change
        if (onNotesChange) {
          onNotesChange(updatedNotes);
        }
        // Also trigger global refresh if available
        if (window.refreshLeadNotes) {
          window.refreshLeadNotes();
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to add note' }));
        alert(errorData.error || 'Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads/${leadId}/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const updatedNotes = notes.filter(note => note.id !== noteId);
        setNotes(updatedNotes);
        // Notify parent component about the change
        if (onNotesChange) {
          onNotesChange(updatedNotes);
        }
        // Also trigger global refresh if available
        if (window.refreshLeadNotes) {
          window.refreshLeadNotes();
        }
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to delete note' }));
        alert(error.error || 'Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting note. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${month} ${day}, ${displayHours}:${displayMinutes} ${ampm}`;
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
              <div className="note-header">
                <div className="note-author-info">
                  <div className="note-author">{note.user_name || 'You'}</div>
                  <div className="note-timestamp">{formatDate(note.created_at)}</div>
                </div>
                <div className="note-actions">
                  <button 
                    className="note-action-btn edit-btn" 
                    title="Edit note"
                    onClick={() => {
                      // TODO: Implement edit functionality
                      alert('Edit functionality coming soon');
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button 
                    className="note-action-btn delete-btn" 
                    title="Delete note"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="note-content">{note.content}</div>
              {notes.length === 1 && notes[0].id === note.id && (
                <div className="note-instructions">
                  <ul>
                    <li>Notes are a great way to capture key information about your Contact/Deal internally.</li>
                    <li>Type "@" to mention fellow users in your organization and start a discussion right from a note.</li>
                  </ul>
                </div>
              )}
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

