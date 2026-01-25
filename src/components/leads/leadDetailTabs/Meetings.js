import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'react-toastify';
import './Meetings.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const CalendarIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
  </svg>
);

const ClockIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const VideoIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
);

const PlusIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const CloseIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

function Meetings({ leadEmail, leadName, leadId }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    attendees: '',
    timezone: 'UTC',
    reminderMinutes: 15
  });
  const [attendeeEmails, setAttendeeEmails] = useState([]);
  const [currentEmail, setCurrentEmail] = useState('');

  useEffect(() => {
    fetchMeetings();
  }, [leadEmail]);

  const fetchMeetings = async () => {
    if (!leadEmail) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/calendar/events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter meetings that include the lead's email
        const leadMeetings = (data.events || []).filter(event => {
          const attendees = event.attendees || [];
          return attendees.some(attendee => 
            attendee.email && attendee.email.toLowerCase() === leadEmail.toLowerCase()
          );
        });
        setMeetings(leadMeetings);
      } else {
        console.error('Failed to fetch meetings');
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate that end time is after start time
    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);
    
    if (endDate <= startDate) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const attendeesArray = attendeeEmails;

      const response = await fetch(`${API_URL}/calendar/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          startTime: formData.startTime,
          endTime: formData.endTime,
          attendees: attendeesArray,
          timezone: formData.timezone,
          reminderMinutes: parseInt(formData.reminderMinutes)
        })
      });

      if (response.ok) {
        toast.success('Meeting created successfully!');
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          startTime: '',
          endTime: '',
          attendees: '',
          timezone: 'UTC',
          reminderMinutes: 15
        });
        setAttendeeEmails([]);
        setCurrentEmail('');
        fetchMeetings();
      } else {
        const error = await response.json();
        toast.error('Failed to create meeting: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error('Failed to create meeting');
    }
  };

  const handleEmailInput = (e) => {
    const value = e.target.value;
    setCurrentEmail(value);

    if (value.endsWith(',') || value.endsWith(' ')) {
      const email = value.slice(0, -1).trim();
      if (email && validateEmail(email)) {
        if (!attendeeEmails.includes(email)) {
          setAttendeeEmails([...attendeeEmails, email]);
        }
        setCurrentEmail('');
      } else if (email) {
        toast.error('Invalid email format');
      }
    }
  };

  const removeEmail = (index) => {
    setAttendeeEmails(attendeeEmails.filter((_, i) => i !== index));
  };

  const openCreateModal = () => {
    // Pre-fill with lead's email
    if (leadEmail && validateEmail(leadEmail)) {
      setAttendeeEmails([leadEmail]);
    }
    setShowCreateModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const isPastMeeting = (endTime) => {
    return new Date(endTime) < new Date();
  };

  const isUpcomingMeeting = (startTime) => {
    return new Date(startTime) > new Date();
  };

  if (loading) {
    return (
      <div className="meetings-loading">
        <div className="meetings-spinner" />
        <p>Loading meetings...</p>
      </div>
    );
  }

  return (
    <div className="meetings-container">
      <div className="meetings-header">
        <div className="meetings-header-left">
          <CalendarIcon width="24" height="24" style={{ color: '#4285f4' }} />
          <div>
            <h3>Meetings with {leadName || 'Lead'}</h3>
            <p className="meetings-subtitle">
              {meetings.length} meeting{meetings.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
        </div>
        <button className="create-meeting-btn" onClick={openCreateModal}>
          <PlusIcon width="18" height="18" />
          Schedule Meeting
        </button>
      </div>

      {meetings.length === 0 ? (
        <div className="no-meetings">
          <CalendarIcon width="48" height="48" style={{ color: '#d1d5db' }} />
          <h4>No meetings scheduled</h4>
          <p>Schedule your first meeting with {leadName || 'this lead'}</p>
          <button className="create-first-meeting-btn" onClick={openCreateModal}>
            <PlusIcon width="18" height="18" />
            Schedule Meeting
          </button>
        </div>
      ) : (
        <div className="meetings-list">
          {meetings.map((meeting) => (
            <div 
              key={meeting.id} 
              className={`meeting-card ${isPastMeeting(meeting.end.dateTime) ? 'past' : ''}`}
            >
              <div className="meeting-header">
                <h4>{meeting.summary}</h4>
                {isUpcomingMeeting(meeting.start.dateTime) && (
                  <span className="meeting-badge upcoming">Upcoming</span>
                )}
                {isPastMeeting(meeting.end.dateTime) && (
                  <span className="meeting-badge past">Completed</span>
                )}
              </div>
              
              <div className="meeting-details">
                <div className="meeting-detail-row">
                  <CalendarIcon width="16" height="16" />
                  <span>{formatDate(meeting.start.dateTime)}</span>
                </div>
                <div className="meeting-detail-row">
                  <ClockIcon width="16" height="16" />
                  <span>
                    {formatTime(meeting.start.dateTime)} - {formatTime(meeting.end.dateTime)}
                  </span>
                </div>
              </div>

              {meeting.description && (
                <p className="meeting-description">{meeting.description}</p>
              )}

              {meeting.hangoutLink && isUpcomingMeeting(meeting.start.dateTime) && (
                <a 
                  href={meeting.hangoutLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="join-meeting-btn"
                >
                  <VideoIcon width="16" height="16" />
                  Join Meeting
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreateModal && ReactDOM.createPortal(
        <div className="create-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="create-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Gradient Header */}
            <div className="create-modal-header">
              <div className="create-header-content">
                <div className="create-icon">✨</div>
                <div className="create-header-text">
                  <h2>Schedule Meeting</h2>
                  <p>Create a calendar event with {leadName || 'this lead'}</p>
                </div>
              </div>
              <button className="create-close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateEvent} className="create-modal-body">
              {/* Lead Banner */}
              {leadName && (
                <div className="create-lead-banner">
                  <div className="create-lead-icon">👤</div>
                  <div className="create-lead-info">
                    <div className="create-lead-label">Meeting with</div>
                    <div className="create-lead-name">{leadName}</div>
                  </div>
                </div>
              )}
              
              {/* Meeting Title */}
              <div className="create-form-field">
                <label className="create-label">
                  <span className="label-icon">📋</span>
                  Meeting Title
                </label>
                <input
                  type="text"
                  className="create-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Product demo, Discovery call..."
                  required
                />
              </div>

              {/* Date & Time Row */}
              <div className="create-time-row">
                <div className="create-form-field">
                  <label className="create-label">
                    <span className="label-icon">🕐</span>
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    className="create-input"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>

                <div className="create-form-field">
                  <label className="create-label">
                    <span className="label-icon">🕐</span>
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    className="create-input"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="create-form-field">
                <label className="create-label">
                  <span className="label-icon">📝</span>
                  Description
                </label>
                <textarea
                  className="create-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add meeting agenda, notes, or details..."
                  rows="3"
                />
              </div>

              {/* Attendees */}
              <div className="create-form-field">
                <label className="create-label">
                  <span className="label-icon">👥</span>
                  Attendees
                  <span className="label-hint">Type email and press comma or space</span>
                </label>
                <div className="create-email-container">
                  {attendeeEmails.length > 0 && (
                    <div className="create-email-tags">
                      {attendeeEmails.map((email, index) => (
                        <span key={index} className="create-email-tag">
                          {email}
                          <button type="button" className="tag-remove" onClick={() => removeEmail(index)}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    className="create-email-input"
                    value={currentEmail}
                    onChange={handleEmailInput}
                    placeholder={attendeeEmails.length === 0 ? "colleague@company.com" : "Add another..."}
                  />
                </div>
              </div>

              {/* Reminder */}
              <div className="create-form-field">
                <label className="create-label">
                  <span className="label-icon">🔔</span>
                  Reminder
                </label>
                <select
                  value={formData.reminderMinutes}
                  onChange={(e) => setFormData({ ...formData, reminderMinutes: parseInt(e.target.value) })}
                  className="create-select"
                >
                  <option value={5}>5 minutes before</option>
                  <option value={10}>10 minutes before</option>
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                  <option value={60}>1 hour before</option>
                  <option value={1440}>1 day before</option>
                  <option value={10080}>1 week before</option>
                </select>
              </div>

              {/* Footer Actions */}
              <div className="create-modal-footer">
                <button type="button" className="create-btn-cancel" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="create-btn-submit">
                  <span className="btn-icon">✓</span>
                  Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default Meetings;
