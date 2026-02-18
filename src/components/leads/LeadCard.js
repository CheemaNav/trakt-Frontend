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

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
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

  const statusColor = lead.stage_color || statusColors[lead.status] || '#6b7280';

  // Lead type configuration - only show if lead_type is set
  const getLeadTypeConfig = (leadType) => {
    if (!leadType) return null;
    const type = leadType.toLowerCase();
    switch (type) {
      case 'hot':
        return { icon: '🔥', label: 'Hot', color: '#ea4335' };
      case 'warm':
        return { icon: '🌤', label: 'Warm', color: '#fbbc04' };
      case 'cold':
        return { icon: '❄️', label: 'Cold', color: '#1a73e8' };
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

    const isClosed = lead.status === 'won' || lead.status === 'Closed' || lead.status === 'closed';
    return !isClosed && expiryDate < today;
  };

  const expired = isExpired();

  // Format relative time
  const getRelativeTime = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  // Format close date
  const formatCloseDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const ownerName = lead.owner_name || lead.owner_email || null;
  const ownerInitial = ownerName ? ownerName.charAt(0).toUpperCase() : null;
  const contactEmail = lead.email || null;
  const contactPhone = lead.phone || null;
  const closeDate = lead.expected_close_date || lead.expectedCloseDate || null;
  const createdAt = lead.created_at || lead.createdAt || null;
  const country = lead.country || lead.deal_country || null;

  return (
    <div className={`lead-card-deal ${expired ? 'expired-lead' : ''}`}>
      {/* Top Row: Title + Badge */}
      <div className="card-top-row">
        <h3 className="deal-title">
          {lead.title || lead.name || lead.company || 'Untitled Deal'}
        </h3>
        <div className="card-badges">
          {leadTypeConfig && (
            <div
              className="lead-type-badge"
              style={{ backgroundColor: leadTypeConfig.color }}
              title={leadTypeConfig.label + ' Lead'}
            >
              <span className="lead-type-icon">{leadTypeConfig.icon}</span>
            </div>
          )}
        </div>
      </div>

      {/* Company */}
      {(lead.company || lead.label) && (
        <p className="deal-company">
          {lead.company || lead.label}
        </p>
      )}

      {/* Contact Details Row */}
      {(contactEmail || contactPhone) && (
        <div className="card-contact-row">
          {contactEmail && (
            <span className="card-contact-item" title={contactEmail}>
              <span className="card-contact-icon"><MailIcon /></span>
              <span className="card-contact-text">{contactEmail}</span>
            </span>
          )}
          {contactPhone && (
            <span className="card-contact-item" title={contactPhone}>
              <span className="card-contact-icon"><PhoneIcon /></span>
              <span className="card-contact-text">{contactPhone}</span>
            </span>
          )}
        </div>
      )}

      {/* Dates Row */}
      {(closeDate || createdAt) && (
        <div className="card-dates-row">
          {closeDate && (
            <span className={`card-date-item ${expired ? 'date-expired' : ''}`} title={`Expected close: ${new Date(closeDate).toLocaleDateString()}`}>
              <span className="card-date-icon"><CalendarIcon /></span>
              <span>{formatCloseDate(closeDate)}</span>
            </span>
          )}
          {createdAt && (
            <span className="card-date-item" title={`Created: ${new Date(createdAt).toLocaleDateString()}`}>
              <span className="card-date-icon"><ClockIcon /></span>
              <span>{getRelativeTime(createdAt)}</span>
            </span>
          )}
        </div>
      )}

      {/* Footer: Value + Owner */}
      <div className="deal-footer">
        <span className="deal-value">
          <span className="deal-value-icon">
            <BriefcaseIcon />
          </span>
          {formatValue(lead.value, lead.currency || 'USD')}
        </span>

        <div className="card-footer-right">
          {country && (
            <span className="card-country" title={country}>
              {country}
            </span>
          )}
          {ownerInitial && (
            <div className="card-owner-avatar" title={ownerName}>
              {ownerInitial}
            </div>
          )}
        </div>
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
