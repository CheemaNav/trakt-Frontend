import React, { useState } from 'react';
import './LeadCard.css';

const statusColors = {
  'Not Contacted': '#1a73e8',
  Contacted: '#fbbc04',
  Closed: '#34a853',
  Lost: '#ea4335'
};

const BriefcaseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 7h16a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a1 1 0 0 1 1-1Z" />
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    <path d="M3 13h18" />
  </svg>
);

function LeadCard({ lead, onDelete, onEdit }) {
  const [showActions, setShowActions] = useState(false);

  const formatValue = (value, currency = 'USD') => {
    if (!value || value === 0) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(0);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const statusColor = statusColors[lead.status] || '#6b7280';

  // Lead type configuration - only show if lead_type is set
  const getLeadTypeConfig = (leadType) => {
    if (!leadType) return null;
    const type = leadType.toLowerCase();
    switch(type) {
      case 'hot':
        return { icon: '🔥', label: 'Hot Lead', color: '#ea4335' };
      case 'warm':
        return { icon: '🌤', label: 'Warm Lead', color: '#fbbc04' };
      case 'cold':
        return { icon: '❄️', label: 'Cold Lead', color: '#1a73e8' };
      default:
        return null;
    }
  };

  const leadTypeConfig = getLeadTypeConfig(lead.lead_type || lead.leadType);

  // Check if lead is expired (expected_close_date has passed)
  const isExpired = () => {
    const closeDate = lead.expected_close_date || lead.expectedCloseDate;
    if (!closeDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(closeDate);
    expiryDate.setHours(0, 0, 0, 0);
    
    // Only consider expired if status is not 'won' or 'closed'
    const isClosed = lead.status === 'won' || lead.status === 'Closed' || lead.status === 'closed';
    return !isClosed && expiryDate < today;
  };

  const expired = isExpired();

  return (
    <div className={`lead-card-deal ${expired ? 'expired-lead' : ''}`}>
      {/* Lead Type Badge - Top Right - Only show if lead_type is set */}
      {leadTypeConfig && (
        <div 
          className="lead-type-badge" 
          style={{ backgroundColor: leadTypeConfig.color }}
          title={leadTypeConfig.label}
        >
          <span className="lead-type-icon">{leadTypeConfig.icon}</span>
          <span className="lead-type-label">{leadTypeConfig.label}</span>
        </div>
      )}

      {/* Status Icon - Top Right */}
      <div 
        className="deal-status-icon" 
        style={{ backgroundColor: statusColor }}
        aria-hidden="true"
        title={lead.status}
      >
        <span className="deal-status-icon-indicator" />
      </div>

      {/* Deal Title */}
      <h3 className="deal-title">
        {lead.title || lead.name || lead.company || 'Untitled Deal'}
      </h3>

      {/* Company Name */}
      <p className="deal-company">
        {lead.company || lead.name || 'No company set'}
      </p>

      {/* Value and Assignee */}
      <div className="deal-footer">
        <span className="deal-value">
          <span className="deal-value-icon">
            <BriefcaseIcon />
          </span>
          {formatValue(lead.value, lead.currency || 'USD')}
        </span>
        {/* <button 
          className="deal-actions-toggle"
          onClick={(e) => {
            e.stopPropagation();
            setShowActions(!showActions);
          }}
        >
          ⋮
        </button> */}
      </div>

      {/* Actions Menu (shown when toggle is clicked) */}
      {showActions && (
        <div className="deal-actions-menu" onClick={(e) => e.stopPropagation()}>
          <button 
            className="action-menu-item"
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(false);
              if (onEdit) onEdit();
            }}
          >
            Edit
          </button>
          <button 
            className="action-menu-item"
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(false);
            }}
          >
            View Details
          </button>
          <button 
            className="action-menu-item action-menu-delete"
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(false);
              onDelete();
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default LeadCard;
