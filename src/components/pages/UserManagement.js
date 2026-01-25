import React, { useState, useEffect, useMemo } from 'react';
import './UserManagement.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const UsersIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const EnvelopeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const ChevronDownIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({}); // Store statistics for each user
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Customer' });
  const [inviteUser, setInviteUser] = useState({ email: '', role: 'Customer' });
  const [currentUser, setCurrentUser] = useState(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });

  // Refresh current user from localStorage on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      console.log('Current user loaded:', user); // Debug log
    }
  }, []);

  // Sample countries list
  const countries = [
    'United States',
    'India',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France',
    'Japan',
    'China',
    'Brazil'
  ];

  useEffect(() => {
    fetchUsers();
    fetchPipelines();
  }, []);

  useEffect(() => {
    // Fetch statistics for all users
    if (users.length > 0) {
      users.forEach(user => {
        fetchUserStatistics(user.id);
      });
    }
  }, [users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Fetch users including sub-users
      const response = await fetch(`${API_URL}/users?include_subusers=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched users from API:', data.users); // Debug log
        
        // Refresh current user from localStorage to ensure we have latest data
        const userStr = localStorage.getItem('user');
        const latestCurrentUser = userStr ? JSON.parse(userStr) : null;
        if (latestCurrentUser) {
          setCurrentUser(latestCurrentUser);
          console.log('Current user refreshed from localStorage:', latestCurrentUser); // Debug log
        }
        
        // Add default values for role, countries, pipeline, and level
        const usersWithDefaults = (data.users || []).map(user => ({
          ...user,
          id: user.id, // Keep original ID
          parent_id: user.parent_id || null, // Keep parent_id (could be null or number)
          role: user.role || 'Customer',
          countries: user.countries ? (Array.isArray(user.countries) ? user.countries : JSON.parse(user.countries)) : [],
          pipeline: user.pipeline_id || null,
          status: user.status || 'active',
          level: user.level || 0 // Keep level from backend (for hierarchy depth)
        }));
        console.log('Users with defaults:', usersWithDefaults.map(u => ({ id: u.id, email: u.email, parent_id: u.parent_id, name: u.name }))); // Debug log
        console.log('Current user ID:', latestCurrentUser?.id || currentUser?.id); // Debug log
        setUsers(usersWithDefaults);
      } else {
        const errorData = await response.json();
        console.error('Error fetching users:', errorData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStatistics = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/${userId}/statistics?include_subusers=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserStats(prev => ({
          ...prev,
          [userId]: data.statistics
        }));
      }
    } catch (error) {
      console.error(`Error fetching statistics for user ${userId}:`, error);
    }
  };

  const fetchPipelines = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/pipelines`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPipelines(data.pipelines || []);
      }
    } catch (error) {
      console.error('Error fetching pipelines:', error);
    }
  };

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setEditingData({
      countries: user.countries || [],
      pipeline: user.pipeline || null
    });
  };

  const handleSave = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          countries: editingData.countries,
          pipeline_id: editingData.pipeline
        })
      });

      if (response.ok) {
        await fetchUsers();
        setEditingUserId(null);
        setEditingData({});
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving changes. Please try again.');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchUsers();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user. Please try again.');
    }
  };

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem('token');
      // Create user under current user (parent_id will be set automatically by backend)
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('User created response:', responseData); // Debug log
        console.log('Created user parent_id:', responseData.user?.parent_id, 'Current user ID:', currentUser?.id); // Debug log
        
        // Close modal first
        setShowAddModal(false);
        setNewUser({ name: '', email: '', password: '', role: 'Customer' });
        
        // Refresh current user from localStorage to ensure we have latest data
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const latestUser = JSON.parse(userStr);
          setCurrentUser(latestUser);
          console.log('Current user refreshed:', latestUser);
        }
        
        // Refresh the user list immediately, then again after a delay to ensure DB is updated
        await fetchUsers();
        setTimeout(() => {
          console.log('Refreshing users again after delay...');
          fetchUsers();
        }, 1500);
        
        // Show success message
        alert('User created successfully! The page will refresh to show the new user.');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error adding user. Please try again.');
    }
  };

  const handleInviteUser = async () => {
    try {
      const token = localStorage.getItem('token');
      // Create user with invite status under current user
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: inviteUser.email.split('@')[0], // Use email prefix as name
          ...inviteUser,
          status: 'invited'
        })
      });

      if (response.ok) {
        await fetchUsers();
        setShowInviteModal(false);
        setInviteUser({ email: '', role: 'Customer' });
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to invite user');
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      alert('Error inviting user. Please try again.');
    }
  };

  // Filter to show current user and ALL their descendants (multi-level hierarchy)
  const filteredUsers = useMemo(() => {
    if (!currentUser || !currentUser.id) {
      console.log('No current user found, users:', users.length);
      return [];
    }

    const currentUserId = typeof currentUser.id === 'string' ? parseInt(currentUser.id) : currentUser.id;
    console.log('Filtering users - Current user ID:', currentUserId, 'Total users:', users.length);
    
    // Build a map of all users by ID for quick lookup
    const userMap = new Map();
    users.forEach(user => {
      userMap.set(Number(user.id), user);
    });
    
    // Build a tree structure starting from current user
    const buildTree = (userId, level = 0) => {
      const result = [];
      const user = userMap.get(Number(userId));
      
      if (!user) return result;
      
      // Add current user with level
      const userWithLevel = { ...user, level };
      result.push(userWithLevel);
      
      // Find all direct children
      const children = users.filter(u => {
        const parentId = u.parent_id != null ? (typeof u.parent_id === 'string' ? parseInt(u.parent_id, 10) : Number(u.parent_id)) : null;
        return parentId === Number(userId);
      });
      
      // Recursively add children
      children.forEach(child => {
        result.push(...buildTree(child.id, level + 1));
      });
      
      return result;
    };
    
    // Build tree starting from current user
    const treeUsers = buildTree(currentUserId);
    
    // Apply tab filter
    const filtered = treeUsers.filter(user => {
      if (activeTab === 'active') {
        return user.status !== 'invited';
      } else {
        return user.status === 'invited';
      }
    });
    
    console.log('Filtered tree users:', filtered.map(u => ({ id: u.id, email: u.email, level: u.level, parent_id: u.parent_id })));
    
    return filtered;
  }, [users, currentUser, activeTab]);

  const isSubUser = (user) => user.parent_id === currentUser?.id;
  const isCurrentUser = (user) => user.id === currentUser?.id;

  const isEditing = (userId) => editingUserId === userId;

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <div className="user-management-tabs">
          <button
            className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            <UsersIcon className="tab-icon" />
            <span>Active</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'invited' ? 'active' : ''}`}
            onClick={() => setActiveTab('invited')}
          >
            <EnvelopeIcon className="tab-icon" />
            <span>Invited</span>
          </button>
        </div>
        <div className="user-management-actions">
          <button
            className="add-user-btn outline"
            onClick={() => setShowAddModal(true)}
          >
            + Add User
          </button>
          <button
            className="add-user-btn solid"
            onClick={() => setShowInviteModal(true)}
          >
            + Invite user
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading users...</div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Leads</th>
                <th>Sub-Users</th>
                <th>Countries</th>
                <th>Pipeline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    No {activeTab === 'active' ? 'active' : 'invited'} sub-users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const stats = userStats[user.id] || { total_leads: 0, sub_users_count: 0 };
                  const level = user.level || 0;
                  const indent = level > 0 ? level * 20 : 0; // 20px per level
                  
                  return (
                    <tr key={user.id} className={isCurrentUser(user) ? '' : 'sub-user-row'}>
                      <td>
                        <div className="user-name-cell" style={{ paddingLeft: `${indent}px` }}>
                          {level > 0 && <span className="sub-user-indicator">└─</span>}
                          {user.name}
                          {isEditing(user.id) && (
                            <ChevronDownIcon className="edit-indicator" />
                          )}
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.role || 'Customer'}</td>
                      <td>
                        <span className="stat-badge leads-badge">
                          {stats.total_leads || 0}
                        </span>
                      </td>
                      <td>
                        <span className="stat-badge users-badge">
                          {stats.sub_users_count || 0}
                        </span>
                      </td>
                    <td>
                      {isEditing(user.id) ? (
                        <select
                          multiple
                          className="countries-select"
                          value={editingData.countries || []}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                            setEditingData({ ...editingData, countries: selected });
                          }}
                          size="3"
                        >
                          {countries.map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="countries-display">
                          {user.countries && user.countries.length > 0
                            ? user.countries.join(', ')
                            : '-'}
                        </span>
                      )}
                    </td>
                    <td>
                      {isEditing(user.id) ? (
                        <select
                          className="pipeline-select"
                          value={editingData.pipeline || ''}
                          onChange={(e) => setEditingData({ ...editingData, pipeline: e.target.value })}
                        >
                          <option value="">Select pipeline</option>
                          {pipelines.map(pipeline => (
                            <option key={pipeline.id} value={pipeline.id}>
                              {pipeline.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="pipeline-display">
                          {user.pipeline
                            ? pipelines.find(p => p.id === user.pipeline)?.name || '-'
                            : '-'}
                        </span>
                      )}
                    </td>
                    <td>
                      {isCurrentUser(user) ? (
                        <span className="admin-badge" style={{ color: '#1976d2', fontWeight: 600 }}>
                          Admin
                        </span>
                      ) : isEditing(user.id) ? (
                        <div className="action-buttons">
                          <button
                            className="save-btn"
                            onClick={() => handleSave(user.id)}
                          >
                            Save
                          </button>
                          <button
                            className="cancel-btn-small"
                            onClick={() => {
                              setEditingUserId(null);
                              setEditingData({});
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          {user.role === 'Admin' ? (
                            <span className="admin-badge">Admin</span>
                          ) : (
                            <>
                              <button
                                className="edit-btn"
                                onClick={() => handleEdit(user)}
                              >
                                Edit
                              </button>
                              <button
                                className="delete-btn"
                                onClick={() => handleDelete(user.id)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add User</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password (optional)"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="Customer">Customer</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleAddUser}>
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Invite User</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={inviteUser.email}
                  onChange={(e) => setInviteUser({ ...inviteUser, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={inviteUser.role}
                  onChange={(e) => setInviteUser({ ...inviteUser, role: e.target.value })}
                >
                  <option value="Customer">Customer</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleInviteUser}>
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;

