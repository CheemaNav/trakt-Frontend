import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TopBar.css';

const BellIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M10 21a2 2 0 0 0 4 0" />
    <path d="M18 16v-4a6 6 0 1 0-12 0v4l-1.5 2h15Z" />
  </svg>
);

const ProfileIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 19a7 7 0 0 1 14 0" />
  </svg>
);

const LogoutIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
    <path d="M12 19H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
  </svg>
);

const HamburgerIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

function TopBar({ user }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const currentUser = user || {};

  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

  const handleLogout = (event) => {
    if (event) event.stopPropagation();
    setShowDropdown(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfile = (event) => {
    if (event) event.stopPropagation();
    setShowDropdown(false);
    navigate('/profile');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      if (!sidebarOpen) {
        sidebar.classList.add('open');
      } else {
        sidebar.classList.remove('open');
      }
    }
  };

  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showDropdown]);

  const notifications = [
    { id: 1, text: 'New deal assigned to you', time: '2 hours ago' },
    { id: 2, text: 'Meeting reminder at 3 PM', time: '5 hours ago' },
    { id: 3, text: 'Contact added successfully', time: '1 day ago' },
  ];

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="hamburger-button"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <HamburgerIcon />
        </button>
      </div>

      <div className="topbar-right">
        <div className="topbar-notifications">
          <button 
            type="button"
            className="notification-bell"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label={showNotifications ? 'Hide notifications' : 'Show notifications'}
          >
            <BellIcon />
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}+</span>
            )}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>Notifications</h3>
                <span className="notifications-count">{notifications.length}</span>
              </div>
              <div className="notifications-list">
                {notifications.map((notif) => (
                  <div key={notif.id} className="notification-item">
                    <p>{notif.text}</p>
                    <span className="notification-time">{notif.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          className="topbar-user"
          onClick={toggleDropdown}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              toggleDropdown();
            }
          }}
          role="button"
          tabIndex={0}
          aria-haspopup="true"
          aria-expanded={showDropdown}
        >
          <div className="user-avatar">
            {getInitials(currentUser.name)}
          </div>
          <div className="user-info">
            <div className="user-name">{currentUser.name || 'User'}</div>
            {/* <div className="user-email">{currentUser.email || 'user@example.com'}</div> */}
          </div>
          

          {showDropdown && (
            <div
              className="user-dropdown"
              ref={dropdownRef}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="dropdown-header">
                <div className="dropdown-avatar">{getInitials(currentUser.name)}</div>
                <div className="dropdown-user">
                  <div className="dropdown-name">{currentUser.name || 'User'}</div>
                  <div className="dropdown-email">{currentUser.email || 'user@example.com'}</div>
                </div>
              </div>
              <div className="dropdown-divider" />
              <button type="button" className="dropdown-item" onClick={handleProfile}>
                <span className="dropdown-item-icon">
                  <ProfileIcon />
                </span>
                <span>Profile</span>
              </button>
              <button type="button" className="dropdown-item" onClick={handleLogout}>
                <span className="dropdown-item-icon">
                  <LogoutIcon />
                </span>
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TopBar;

