import React from 'react';
import './Profile.css';

function Profile({ user }) {
  const storedUser =
    (user && Object.keys(user).length > 0 && user) ||
    JSON.parse(localStorage.getItem('user') || '{}');

  const profileFields = [
    { label: 'Full name', value: storedUser?.name || 'Not provided' },
    { label: 'Email address', value: storedUser?.email || 'Not provided' },
    { label: 'Role', value: storedUser?.role || 'Member' },
  ];

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {storedUser?.name
              ? storedUser.name
                  .split(' ')
                  .map(part => part[0])
                  .join('')
                  .toUpperCase()
                  .substring(0, 2)
              : 'U'}
          </div>
          <div className="profile-heading">
            <h1>My Profile</h1>
            <p>Manage your personal information and preferences.</p>
          </div>
        </div>

        <div className="profile-details">
          {profileFields.map(field => (
            <div key={field.label} className="profile-detail">
              <span className="profile-detail-label">{field.label}</span>
              <span className="profile-detail-value">{field.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;


