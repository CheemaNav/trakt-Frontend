import React, { useState, useEffect } from 'react';
import './History.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function History({ leadId }) {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [leadId]);

  const fetchActivities = async () => {
    console.log('Fetching activities for lead:', leadId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads/${leadId}/activities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('Activities response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Activities data:', data);
        setActivities(data.activities || []);
      } else {
        console.error('Failed to fetch activities');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
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

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'email':
        return '📧';
      case 'note':
        return '📝';
      case 'call':
        return '📞';
      case 'file':
        return '📎';
      case 'status_change':
        return '🔄';
      default:
        return '📋';
    }
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.activity_type === filter);

  return (
    <div className="timeline-panel">
      <div className="timeline-toolbar">
        <h2>History</h2>
        <select className="timeline-filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="email">Emails</option>
          <option value="note">Notes</option>
          <option value="call">Calls</option>
          <option value="file">Files</option>
          <option value="status_change">Status Changes</option>
        </select>
      </div>
      <div className="timeline-scroll">
        <ul className="timeline-list">
          {loading ? (
            <li className="timeline-entry">
              <div className="timeline-marker" />
              <div className="timeline-entry-content">
                <div className="timeline-entry-title">Loading...</div>
              </div>
            </li>
          ) : filteredActivities && filteredActivities.length > 0 ? (
            filteredActivities.map((item) => (
              <li key={item.id} className="timeline-entry">
                <div className="timeline-marker">{getActivityIcon(item.activity_type)}</div>
                <div className="timeline-entry-content">
                  <div className="timeline-entry-title">
                    <strong>{item.action}</strong>
                    {item.details && <span> - {item.details}</span>}
                  </div>
                  <div className="timeline-entry-meta">
                    {formatDate(item.created_at)} · {item.user_name || 'System'}
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="timeline-entry">
              <div className="timeline-marker" />
              <div className="timeline-entry-content">
                <div className="timeline-entry-title">No history available</div>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default History;







