import React, { useState, useEffect } from 'react';
import './History.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function History({ leadId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!leadId) {
      setLoading(false);
      return;
    }
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  const fetchActivities = async () => {
    if (!leadId) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/leads/${leadId}/activities`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Activities fetched:', data.activities?.length || 0, 'activities');
        setActivities(data.activities || []);
      } else if (response.status === 404) {
        // Lead not found or no activities yet
        console.log('No activities found for lead:', leadId);
        setActivities([]);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch activities' }));
        console.error('Error fetching activities:', response.status, errorData);
        setActivities([]);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const formatDateLabel = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    const activityDate = new Date(date);
    activityDate.setHours(0, 0, 0, 0);

    if (activityDate.getTime() === today.getTime()) {
      return 'TODAY';
    } else if (activityDate.getTime() === yesterday.getTime()) {
      return 'YESTERDAY';
    } else {
      const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month} ${day}, ${year}`;
    }
  };

  const getActivityIcon = (activityType, action) => {
    const type = (activityType || '').toLowerCase();
    if (type === 'note' || type === 'to-do') {
      if (action === 'Note deleted') {
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <path d="M14 2v6h6"></path>
            <path d="M10 12h4"></path>
          </svg>
        );
      }
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <path d="M14 2v6h6"></path>
          <path d="M12 18v-6"></path>
          <path d="M9 15h6"></path>
        </svg>
      );
    }
    if (type === 'stage') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3h18v4H3z"></path>
          <path d="M3 8h18v12H3z"></path>
          <path d="M8 12h8"></path>
          <path d="M12 3v4"></path>
        </svg>
      );
    }
    if (type === 'field_update') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"></rect>
          <path d="M9 9h6v6H9z"></path>
        </svg>
      );
    }
    if (type === 'call') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 8.63 19 19.5 19.5 0 0 1 2.6 12.4a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 1.53 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L5.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2Z"></path>
        </svg>
      );
    }
    if (type === 'email') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      );
    }
    if (type === 'file') {
      return (
        <div className="file-upload-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" fill="#e3f2fd" stroke="#2196f3"></rect>
            <path d="M12 8v8M8 12h8" stroke="#2196f3" strokeWidth="2"></path>
          </svg>
        </div>
      );
    }
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
      </svg>
    );
  };

  const formatActivityDetails = (activity) => {
      const type = (activity.activity_type || '').toLowerCase();
      if (type === 'stage') {
        return activity.note || activity.details || `'${activity.old_value}' to '${activity.new_value}'`;
      }
      if (type === 'field_update') {
        const fieldNames = activity.details ? activity.details.split(', ').map(d => {
          const parts = d.split(':');
          return parts[0];
        }).join(', ') : 'Fields';
        return activity.note || activity.details || `${fieldNames} updated`;
      }
      return activity.note || activity.details || activity.summary || activity.action || '';
    };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    const type = (activity.activity_type || '').toLowerCase();
    if (filter === 'notes') return type === 'note' || type === 'to-do';
    if (filter === 'activities') return type !== 'note' && type !== 'to-do';
    return true;
  });

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const dateLabel = formatDateLabel(activity.created_at);
    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(activity);
    return groups;
  }, {});

  if (!leadId) {
    return (
      <div className="timeline-panel">
        <div className="timeline-toolbar">
          <h2>History</h2>
        </div>
        <div className="timeline-empty">
          <p>No lead ID provided</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="timeline-panel">
        <div className="timeline-toolbar">
          <h2>History</h2>
        </div>
        <div className="history-loading">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="timeline-panel">
      <div className="timeline-toolbar">
        <h2>History</h2>
        <select
          className="timeline-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="activities">Activities</option>
          <option value="notes">Notes</option>
        </select>
      </div>
      <div className="timeline-scroll">
        {Object.keys(groupedActivities).length > 0 ? (
          Object.keys(groupedActivities).map((dateLabel) => (
            <div key={dateLabel}>
              <div className="timeline-date-marker">
                <div className="timeline-date-dot"></div>
                <span className="timeline-date-label">{dateLabel}</span>
              </div>
              <ul className="timeline-list">
                {groupedActivities[dateLabel].map((activity) => (
                  <li key={activity.id} className="timeline-entry">
                    <div className="timeline-marker">
                      <div className="timeline-icon">
                        {getActivityIcon(activity.activity_type, activity.action)}
                      </div>
                    </div>
                    <div className="timeline-entry-content">
                      <div className="timeline-entry-title">
                        {activity.summary || activity.action || activity.activity_type} by {activity.user_name || 'Unknown'}
                      </div>
                      <div className="timeline-entry-details">
                        {formatActivityDetails(activity)}
                      </div>
                      <div className="timeline-entry-meta">
                        {formatTime(activity.created_at)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <div className="timeline-empty">
            <p>No history available</p>
            {leadId && (
              <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '10px' }}>
                Activities will appear here when you add notes, update fields, or change stages.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
