import React, { useState, useEffect } from 'react';
import './Call.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function Call({ leadId }) {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [callForm, setCallForm] = useState({
    duration: '',
    outcome: 'completed',
    notes: ''
  });
  const [addingCall, setAddingCall] = useState(false);

  useEffect(() => {
    fetchCalls();
  }, [leadId]);

  const fetchCalls = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads/${leadId}/calls`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCalls(data.calls || []);
      }
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCall = async (e) => {
    e.preventDefault();
    setAddingCall(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads/${leadId}/calls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(callForm)
      });

      if (response.ok) {
        const data = await response.json();
        setCalls([data.call, ...calls]);
        setCallForm({ duration: '', outcome: 'completed', notes: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding call:', error);
    } finally {
      setAddingCall(false);
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

  const formatDuration = (minutes) => {
    if (!minutes) return '0 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  if (loading) {
    return <div className="calls-loading">Loading calls...</div>;
  }

  return (
    <div className="calls-panel">
      <div className="calls-header">
        <h2>Calls</h2>
        <div className="calls-header-actions">
          <span className="calls-count">{calls.length}</span>
          <button 
            className="add-call-btn" 
            onClick={() => setShowAddForm(!showAddForm)}
          >
            + Log Call
          </button>
        </div>
      </div>

      {showAddForm && (
        <form className="call-form" onSubmit={handleAddCall}>
          <div className="call-form-row">
            <div className="call-form-field">
              <label>Duration (minutes)</label>
              <input
                type="number"
                value={callForm.duration}
                onChange={(e) => setCallForm({ ...callForm, duration: e.target.value })}
                placeholder="e.g., 15"
                min="0"
              />
            </div>
            <div className="call-form-field">
              <label>Outcome</label>
              <select
                value={callForm.outcome}
                onChange={(e) => setCallForm({ ...callForm, outcome: e.target.value })}
              >
                <option value="completed">Completed</option>
                <option value="no_answer">No Answer</option>
                <option value="busy">Busy</option>
                <option value="voicemail">Voicemail</option>
              </select>
            </div>
          </div>
          <div className="call-form-field">
            <label>Notes</label>
            <textarea
              value={callForm.notes}
              onChange={(e) => setCallForm({ ...callForm, notes: e.target.value })}
              placeholder="Add call notes..."
              rows={3}
            />
          </div>
          <div className="call-form-actions">
            <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
            <button type="submit" disabled={addingCall}>
              {addingCall ? 'Logging...' : 'Log Call'}
            </button>
          </div>
        </form>
      )}

      <div className="calls-list">
        {calls.length > 0 ? (
          calls.map((call) => (
            <div key={call.id} className="call-item">
              <div className="call-icon">📞</div>
              <div className="call-content">
                <div className="call-header">
                  <span className="call-outcome">{call.outcome}</span>
                  <span className="call-duration">{formatDuration(call.duration)}</span>
                </div>
                {call.notes && <div className="call-notes">{call.notes}</div>}
                <div className="call-meta">
                  {formatDate(call.created_at)} · {call.user_name || 'You'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="calls-empty">
            <p>No calls logged yet. Log your first call above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Call;







