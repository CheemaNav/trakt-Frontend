import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const CalendarIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const HomeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M3 9.5 12 3l9 6.5" />
    <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
    <path d="M9 21v-6h6v6" />
  </svg>
);

const LeadsIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M5 3v18" />
    <path d="M5 4h10a3 3 0 0 1 0 6H5" />
    <path d="M5 10h12a3 3 0 0 1 0 6H5" />
  </svg>
);

const ContactIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <circle cx="12" cy="7.5" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </svg>
);

const BuildingIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M4 21h16" />
    <path d="M5 21V5a1 1 0 0 1 1-1h4v17" />
    <path d="M14 21V8h4a1 1 0 0 1 1 1v12" />
    <path d="M7 10h2" />
    <path d="M7 14h2" />
    <path d="M15 12h2" />
  </svg>
);

const CheckCircleIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const BarChartIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M4 19.5V5" />
    <rect x="7" y="9" width="3.5" height="10.5" rx="1" />
    <rect x="12.25" y="6" width="3.5" height="13.5" rx="1" />
    <rect x="17.5" y="12" width="3.5" height="7.5" rx="1" />
  </svg>
);

const SettingsIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.5 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </svg>
);

const DocumentIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M6 3h7l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
    <path d="M13 3v5h5" />
    <path d="M9 13h6" />
    <path d="M9 17h4" />
  </svg>
);

const ShieldUserIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M12 3 4 5v6c0 5.25 3.4 10.3 8 12 4.6-1.7 8-6.75 8-12V5l-8-2Z" />
    <circle cx="12" cy="11" r="3" />
    <path d="M7.5 19a5.5 5.5 0 0 1 9 0" />
  </svg>
);

const PackageIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 18v-2"></path>
    <path d="M3.27 6.96 12 12.01l8.73-5.05"></path>
    <path d="M12 22.08V12"></path>
  </svg>
);

function Sidebar() {
  const location = useLocation();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
    { id: 'leads', label: 'Leads', icon: <LeadsIcon />, path: '/leads' },
    { id: 'contacts', label: 'Contacts', icon: <ContactIcon />, path: '/contacts' },
    { id: 'organization', label: 'Organization', icon: <BuildingIcon />, path: '/organization' },
    { id: 'products', label: 'Products', icon: <PackageIcon />, path: '/products' },
    { id: 'calendar', label: 'Calendar', icon: <CalendarIcon />, path: '/calendar' },
    { id: 'activities', label: 'Activities', icon: <CheckCircleIcon />, path: '/activities' },
    { id: 'reports', label: 'Reports', icon: <BarChartIcon />, path: '/reports' },
    { id: 'user-management', label: 'User Management', icon: <SettingsIcon />, path: '/user-management' },
    { id: 'activity-logs', label: 'Activity Logs', icon: <DocumentIcon />, path: '/activity-logs' },
    { id: 'account-setup', label: 'Account Setup', icon: <ShieldUserIcon />, path: '/account-setup' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar open">
      <div className="sidebar-logo">
        <img src={process.env.REACT_APP_LOGO_URL || "https://traktcrm.com/wp-content/uploads/2025/09/trakt.svg"} alt="TraktCRM" />
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
