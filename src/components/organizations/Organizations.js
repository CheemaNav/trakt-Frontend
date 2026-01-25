import React, { useState, useEffect } from 'react';
import './Organizations.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const SearchIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

const GridIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const MoreIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="19" cy="12" r="1"></circle>
    <circle cx="5" cy="12" r="1"></circle>
  </svg>
);

function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [leads, setLeads] = useState([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const itemsPerPage = 10;

  const [organizationForm, setOrganizationForm] = useState({
    name: '',
    address: '',
    website: '',
    linkedin: '',
    owner: ''
  });

  useEffect(() => {
    fetchOrganizations();
    fetchLeads();
    fetchUsers();
  }, []);

  useEffect(() => {
    const combined = combineOrganizationsAndLeads();
    setFilteredOrganizations(filterOrganizationsList(combined));
  }, [searchQuery, organizations, leads]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/organizations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const combineOrganizationsAndLeads = () => {
    // Convert organizations to unified format
    const orgsList = organizations.map(org => ({
      id: `org-${org.id}`,
      type: 'organization',
      name: org.name,
      address: org.address || 'N/A',
      website: org.website || 'N/A',
      linkedin: org.linkedin || 'N/A',
      owner_id: org.owner_id
    }));

    // Convert leads to organization format (extract company info)
    const leadsList = leads
      .filter(lead => lead.company) // Only leads with company
      .map(lead => ({
        id: `lead-${lead.id}`,
        type: 'lead',
        name: lead.company,
        address: lead.location || 'N/A',
        website: lead.website || 'N/A',
        linkedin: 'N/A',
        owner_id: lead.owner_id,
        lead_id: lead.id
      }));

    // Combine and remove duplicates based on name
    const combined = [...orgsList];
    const existingNames = new Set(orgsList.map(o => o.name.toLowerCase()));

    leadsList.forEach(lead => {
      if (!existingNames.has(lead.name.toLowerCase())) {
        combined.push(lead);
        existingNames.add(lead.name.toLowerCase());
      }
    });

    return combined;
  };

  const filterOrganizationsList = (orgsList) => {
    if (!searchQuery.trim()) {
      return orgsList;
    }
    const query = searchQuery.toLowerCase();
    return orgsList.filter(org => {
      const name = (org.name || '').toLowerCase();
      const address = (org.address || '').toLowerCase();
      const website = (org.website || '').toLowerCase();
      return name.includes(query) || address.includes(query) || website.includes(query);
    });
  };

  const handleAddOrganization = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: organizationForm.name,
          address: organizationForm.address,
          website: organizationForm.website,
          linkedin: organizationForm.linkedin,
          owner_id: organizationForm.owner || null
        })
      });

      if (response.ok) {
        await fetchOrganizations();
        setShowAddModal(false);
        setOrganizationForm({
          name: '',
          address: '',
          website: '',
          linkedin: '',
          owner: ''
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to add organization' }));
        alert(`Error: ${errorData.error || 'Failed to add organization'}`);
      }
    } catch (error) {
      console.error('Error adding organization:', error);
      alert('Error adding organization. Please try again.');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrganizations(currentPageOrganizations.map(o => o.id));
    } else {
      setSelectedOrganizations([]);
    }
  };

  const handleSelectOrganization = (orgId) => {
    setSelectedOrganizations(prev => 
      prev.includes(orgId) 
        ? prev.filter(id => id !== orgId)
        : [...prev, orgId]
    );
  };

  const getOwnerName = (ownerId) => {
    const owner = users.find(u => u.id === ownerId);
    return owner ? owner.name : 'Unassigned';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  // Pagination
  const totalPages = Math.ceil(filteredOrganizations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageOrganizations = filteredOrganizations.slice(startIndex, endIndex);
  const allSelectedOnPage = currentPageOrganizations.length > 0 && currentPageOrganizations.every(o => selectedOrganizations.includes(o.id));

  return (
    <div className="organizations-container">
      <div className="organizations-header">
        <div className="organizations-search">
          <div className="search-input-wrapper">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Search Organization"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <div className="organizations-actions">
          <button className="view-mode-btn">
            <GridIcon className="grid-icon" />
            View Mode
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <button className="add-organization-btn" onClick={() => setShowAddModal(true)}>
            + Add Organization
          </button>
        </div>
      </div>

      <div className="organizations-table-container">
        <table className="organizations-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allSelectedOnPage}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Name</th>
              <th>Address</th>
              <th>Website</th>
              <th>LinkedIn</th>
              <th>Owner</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="loading-cell">Loading organizations...</td>
              </tr>
            ) : currentPageOrganizations.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-cell">No organizations found</td>
              </tr>
            ) : (
              currentPageOrganizations.map(org => (
                <tr key={org.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedOrganizations.includes(org.id)}
                      onChange={() => handleSelectOrganization(org.id)}
                    />
                  </td>
                  <td>
                    <div className="organization-name">
                      <div 
                        className="organization-avatar"
                        style={{ backgroundColor: getAvatarColor(org.name) }}
                      >
                        {getInitials(org.name)}
                      </div>
                      {org.name}
                    </div>
                  </td>
                  <td>{org.address}</td>
                  <td>
                    {org.website !== 'N/A' ? (
                      <a href={org.website.startsWith('http') ? org.website : `https://${org.website}`} target="_blank" rel="noopener noreferrer" className="website-link">
                        {org.website}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    {org.linkedin !== 'N/A' ? (
                      <a href={org.linkedin.startsWith('http') ? org.linkedin : `https://${org.linkedin}`} target="_blank" rel="noopener noreferrer" className="linkedin-link">
                        {org.linkedin}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    {org.owner_id ? (
                      <div className="owner-cell">
                        <div 
                          className="owner-avatar"
                          style={{ backgroundColor: getAvatarColor(getOwnerName(org.owner_id)) }}
                        >
                          {getInitials(getOwnerName(org.owner_id))}
                        </div>
                        {getOwnerName(org.owner_id)}
                      </div>
                    ) : (
                      'Unassigned'
                    )}
                  </td>
                  <td>
                    <button className="action-btn">
                      <MoreIcon />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="organizations-footer">
        <div className="organizations-info">
          Showing {filteredOrganizations.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredOrganizations.length)} of {filteredOrganizations.length} entries
        </div>
        <div className="organizations-pagination">
          <button 
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            &lt;&lt; Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button 
            className="pagination-btn"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          >
            Next &gt;&gt;
          </button>
        </div>
      </div>

      {/* Add Organization Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Organization</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddOrganization} className="organization-form">
              <div className="form-group">
                <label>Organization Name</label>
                <input
                  type="text"
                  value={organizationForm.name}
                  onChange={(e) => setOrganizationForm({ ...organizationForm, name: e.target.value })}
                  placeholder="Enter organization name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={organizationForm.address}
                  onChange={(e) => setOrganizationForm({ ...organizationForm, address: e.target.value })}
                  placeholder="Enter address"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    value={organizationForm.website}
                    onChange={(e) => setOrganizationForm({ ...organizationForm, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="form-group">
                  <label>LinkedIn</label>
                  <input
                    type="url"
                    value={organizationForm.linkedin}
                    onChange={(e) => setOrganizationForm({ ...organizationForm, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/company/example"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Owner</label>
                <select
                  value={organizationForm.owner}
                  onChange={(e) => setOrganizationForm({ ...organizationForm, owner: e.target.value })}
                >
                  <option value="">Select Owner</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Organizations;







