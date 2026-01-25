import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Call.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function Call({ leadId, onCallsChange }) {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [callForm, setCallForm] = useState({
    subject: '',
    description: '',
    related_to: 'Deal',
    deal_id: leadId,
    call_date: '',
    call_time: '',
    duration: '',
    call_type: 'Outbound',
    status: 'Planned',
    assigned_to: ''
  });
  const [addingCall, setAddingCall] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchCalls();
    fetchUsers();
  }, [leadId]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.id) {
          setCallForm(prev => ({ ...prev, assigned_to: currentUser.id }));
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

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
        const fetchedCalls = data.calls || [];
        setCalls(fetchedCalls);
        if (onCallsChange) {
          onCallsChange(fetchedCalls);
        }
      }
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCall = async (e) => {
    e.preventDefault();
    if (!callForm.subject.trim()) {
      alert('Subject is required');
      return;
    }
    if (!callForm.call_date || !callForm.call_time || !callForm.duration) {
      alert('Call Date, Call Time, and Duration are required');
      return;
    }

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
        const updatedCalls = [data.call, ...calls];
        setCalls(updatedCalls);
        if (onCallsChange) {
          onCallsChange(updatedCalls);
        }
        setCallForm({
          subject: '',
          description: '',
          related_to: 'Deal',
          deal_id: leadId,
          call_date: '',
          call_time: '',
          duration: '',
          call_type: 'Outbound',
          status: 'Planned',
          assigned_to: callForm.assigned_to
        });
        setShowModal(false);
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to add call' }));
        alert(error.error || 'Failed to add call');
      }
    } catch (error) {
      console.error('Error adding call:', error);
      alert('Error adding call. Please try again.');
    } finally {
      setAddingCall(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCallDateTime = (dateString, timeString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    const time = timeString || '';
    return `${month}/${day}/${year}${time ? ` at ${time}` : ''}`;
  };

  const handleDeleteCall = async (callId) => {
    if (!window.confirm('Are you sure you want to delete this call?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads/${leadId}/calls/${callId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const updatedCalls = calls.filter(call => call.id !== callId);
        setCalls(updatedCalls);
        if (onCallsChange) {
          onCallsChange(updatedCalls);
        }
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to delete call' }));
        alert(error.error || 'Failed to delete call');
      }
    } catch (error) {
      console.error('Error deleting call:', error);
      alert('Error deleting call. Please try again.');
    }
  };

  const getCurrentUser = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user;
  };

  if (loading) {
    return <div className="calls-loading">Loading calls...</div>;
  }

  return (
    <>
      <div className="calls-panel">
        <div className="calls-header">
          <h2>Calls</h2>
          <div className="calls-header-actions">
            <span className="calls-count">{calls.length}</span>
            <button 
              className="add-call-btn" 
              onClick={() => setShowModal(true)}
            >
              + Add New Call
            </button>
          </div>
        </div>

        {calls.length > 0 ? (
          <div className="calls-table-container">
            <table className="calls-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Description</th>
                  <th>Created At</th>
                  <th>Call Date</th>
                  <th>Call Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((call) => (
                  <tr key={call.id}>
                    <td>{call.subject || 'N/A'}</td>
                    <td>{call.description || 'N/A'}</td>
                    <td>{formatDateTime(call.created_at)}</td>
                    <td>{formatCallDateTime(call.call_date, call.call_time)}</td>
                    <td>{call.call_type || 'N/A'}</td>
                    <td>
                      <select 
                        className="status-select"
                        value={call.status || 'Planned'}
                        onChange={async (e) => {
                          try {
                            const token = localStorage.getItem('token');
                            const response = await fetch(`${API_URL}/leads/${leadId}/calls/${call.id}`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({ status: e.target.value })
                            });
                            if (response.ok) {
                              fetchCalls();
                            }
                          } catch (error) {
                            console.error('Error updating status:', error);
                          }
                        }}
                      >
                        <option value="Planned">Planned</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <button 
                        className="action-btn"
                        onClick={() => handleDeleteCall(call.id)}
                        title="Delete call"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="1"></circle>
                          <circle cx="19" cy="12" r="1"></circle>
                          <circle cx="5" cy="12" r="1"></circle>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-footer">
              <div className="table-info">
                Showing 1 to {calls.length} of {calls.length} entries
              </div>
              <div className="pagination">
                <button className="page-btn" disabled>« Previous</button>
                <button className="page-btn active">1</button>
                <button className="page-btn" disabled>Next »</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="calls-empty">
            <p>No calls logged yet. Add your first call above.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && typeof document !== 'undefined' && createPortal(
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="call-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Call</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <form className="modal-form" onSubmit={handleAddCall}>
              <div className="form-field">
                <label>Subject*</label>
                <input
                  type="text"
                  value={callForm.subject}
                  onChange={(e) => setCallForm({ ...callForm, subject: e.target.value })}
                  placeholder="Enter subject"
                  required
                />
              </div>

              <div className="form-field">
                <label>Description</label>
                <textarea
                  value={callForm.description}
                  onChange={(e) => setCallForm({ ...callForm, description: e.target.value })}
                  placeholder="Enter description"
                  rows={4}
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Related To*</label>
                  <select
                    value={callForm.related_to}
                    onChange={(e) => setCallForm({ ...callForm, related_to: e.target.value })}
                    required
                  >
                    <option value="Deal">Deal</option>
                    <option value="Contact">Contact</option>
                    <option value="Account">Account</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Select Deal*</label>
                  <input
                    type="text"
                    value={callForm.deal_id || leadId}
                    disabled
                    placeholder="Current Deal"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Call Date*</label>
                  <div className="input-with-icon">
                    <input
                      type="date"
                      value={callForm.call_date}
                      onChange={(e) => setCallForm({ ...callForm, call_date: e.target.value })}
                      required
                    />
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                </div>

                <div className="form-field">
                  <label>Call Time*</label>
                  <div className="input-with-icon">
                    <input
                      type="time"
                      value={callForm.call_time}
                      onChange={(e) => setCallForm({ ...callForm, call_time: e.target.value })}
                      required
                    />
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Duration*</label>
                  <select
                    value={callForm.duration}
                    onChange={(e) => setCallForm({ ...callForm, duration: e.target.value })}
                    required
                  >
                    <option value="">Select duration</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Call Type</label>
                  <select
                    value={callForm.call_type}
                    onChange={(e) => setCallForm({ ...callForm, call_type: e.target.value })}
                  >
                    <option value="Inbound">Inbound</option>
                    <option value="Outbound">Outbound</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Status</label>
                  <select
                    value={callForm.status}
                    onChange={(e) => setCallForm({ ...callForm, status: e.target.value })}
                  >
                    <option value="Planned">Planned</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Assigned To</label>
                  <select
                    value={callForm.assigned_to}
                    onChange={(e) => setCallForm({ ...callForm, assigned_to: e.target.value })}
                  >
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} {user.id === getCurrentUser()?.id ? '(You)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={addingCall}>
                  {addingCall ? 'Saving...' : 'Save call'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default Call;
