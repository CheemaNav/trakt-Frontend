import React, { useState, useEffect } from 'react';
import './Contacts.css';
import { TableSkeleton } from '../common/SkeletonLoader';

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

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactDeals, setContactDeals] = useState([]);
  const itemsPerPage = 10;

  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    phoneType: 'Home',
    email: '',
    emailType: 'Work',
    owner: ''
  });

  useEffect(() => {
    fetchContacts();
    fetchLeads();
    fetchUsers();
  }, []);

  useEffect(() => {
    // Combine contacts and leads data
    const combinedContacts = combineContactsAndLeads();
    setFilteredContacts(filterContactsList(combinedContacts));
  }, [searchQuery, contacts, leads]);

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

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/contacts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
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

  const combineContactsAndLeads = () => {
    // Convert contacts to unified format
    const contactsList = contacts.map(contact => ({
      id: `contact-${contact.id}`,
      type: 'contact',
      first_name: contact.first_name,
      last_name: contact.last_name,
      name: `${contact.first_name} ${contact.last_name}`,
      phone: contact.phone,
      phone_type: contact.phone_type,
      email: contact.email,
      email_type: contact.email_type,
      owner_id: contact.owner_id,
      lead_id: null
    }));

    // Convert leads to contact format (extract contact person info)
    const leadsList = leads.map(lead => {
      // Extract name parts from lead name
      const nameParts = (lead.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      return {
        id: `lead-${lead.id}`,
        type: 'lead',
        first_name: firstName,
        last_name: lastName,
        name: lead.name || '',
        phone: lead.phone,
        phone_type: 'Work',
        email: lead.email,
        email_type: 'Work',
        owner_id: lead.owner_id,
        lead_id: lead.id,
        company: lead.company,
        deal_value: lead.value,
        status: lead.status
      };
    });

    // Combine and remove duplicates based on email or phone
    const combined = [...contactsList];
    const existingEmails = new Set(contactsList.map(c => c.email).filter(Boolean));
    const existingPhones = new Set(contactsList.map(c => c.phone).filter(Boolean));

    leadsList.forEach(lead => {
      const emailExists = lead.email && existingEmails.has(lead.email);
      const phoneExists = lead.phone && existingPhones.has(lead.phone);

      if (!emailExists && !phoneExists) {
        combined.push(lead);
        if (lead.email) existingEmails.add(lead.email);
        if (lead.phone) existingPhones.add(lead.phone);
      }
    });

    return combined;
  };

  const filterContactsList = (contactsList) => {
    if (!searchQuery.trim()) {
      return contactsList;
    }
    const query = searchQuery.toLowerCase();
    return contactsList.filter(contact => {
      const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.toLowerCase();
      const phone = (contact.phone || '').toLowerCase();
      const email = (contact.email || '').toLowerCase();
      const company = (contact.company || '').toLowerCase();
      return fullName.includes(query) || phone.includes(query) || email.includes(query) || company.includes(query);
    });
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: contactForm.firstName,
          last_name: contactForm.lastName,
          phone: contactForm.phone,
          phone_type: contactForm.phoneType,
          email: contactForm.email,
          email_type: contactForm.emailType,
          owner_id: contactForm.owner || null
        })
      });

      if (response.ok) {
        await fetchContacts();
        setShowAddModal(false);
        setContactForm({
          firstName: '',
          lastName: '',
          phone: '',
          phoneType: 'Home',
          email: '',
          emailType: 'Work',
          owner: ''
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to add contact' }));
        alert(`Error: ${errorData.error || 'Failed to add contact'}`);
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Error adding contact. Please try again.');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedContacts(currentPageContacts.map(c => c.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (contactId) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleViewContact = async (contact) => {
    setSelectedContact(contact);

    // If it's a lead-based contact, get all deals for this lead
    if (contact.type === 'lead' && contact.lead_id) {
      // Get the specific lead and all leads with same email/phone
      const relatedDeals = leads.filter(lead =>
        lead.id === contact.lead_id ||
        (contact.email && lead.email === contact.email) ||
        (contact.phone && lead.phone === contact.phone)
      );
      setContactDeals(relatedDeals);
    } else if (contact.type === 'contact') {
      // Extract contact ID from the combined ID format
      const contactId = contact.id.replace('contact-', '');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/contacts/${contactId}/deals`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setContactDeals(data.deals || []);
        }
      } catch (error) {
        console.error('Error fetching contact deals:', error);
        // Fallback: find leads by email/phone
        const relatedDeals = leads.filter(lead =>
          (contact.email && lead.email === contact.email) ||
          (contact.phone && lead.phone === contact.phone)
        );
        setContactDeals(relatedDeals);
      }
    } else {
      setContactDeals([]);
    }
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
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageContacts = filteredContacts.slice(startIndex, endIndex);
  const allSelectedOnPage = currentPageContacts.length > 0 && currentPageContacts.every(c => selectedContacts.includes(c.id));

  return (
    <div className="contacts-container">
      <div className="contacts-header">
        <div className="contacts-search">
          <div className="search-input-wrapper">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Search Contact"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <div className="contacts-actions">
          <button className="view-mode-btn">
            <GridIcon className="grid-icon" />
            View Mode
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <button className="add-contact-btn" onClick={() => setShowAddModal(true)}>
            + Add New Contact
          </button>
        </div>
      </div>

      <div className="contacts-table-container">
        <table className="contacts-table">
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
              <th>Phone</th>
              <th>Email</th>
              <th>Owner</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: 0, border: 'none' }}>
                  <TableSkeleton rows={6} columns={5} showCheckbox={true} showAvatar={true} />
                </td>
              </tr>
            ) : currentPageContacts.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-cell">No contacts found</td>
              </tr>
            ) : (
              currentPageContacts.map(contact => (
                <tr key={contact.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => handleSelectContact(contact.id)}
                    />
                  </td>
                  <td>
                    <div className="contact-name">
                      <div
                        className="contact-avatar"
                        style={{ backgroundColor: getAvatarColor(contact.name || `${contact.first_name} ${contact.last_name}`) }}
                      >
                        {getInitials(contact.name || `${contact.first_name} ${contact.last_name}`)}
                      </div>
                      <div>
                        <div>{contact.name || `${contact.first_name} ${contact.last_name}`}</div>
                        {contact.company && (
                          <div className="contact-company">{contact.company}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{contact.phone ? `${contact.phone_type}: ${contact.phone}` : '-'}</td>
                  <td>{contact.email ? `${contact.email_type}: ${contact.email}` : '-'}</td>
                  <td>
                    {contact.owner_id ? (
                      <div className="owner-cell">
                        <div
                          className="owner-avatar"
                          style={{ backgroundColor: getAvatarColor(getOwnerName(contact.owner_id)) }}
                        >
                          {getInitials(getOwnerName(contact.owner_id))}
                        </div>
                        {getOwnerName(contact.owner_id)}
                      </div>
                    ) : (
                      'Unassigned'
                    )}
                  </td>
                  <td>
                    <button className="action-btn" onClick={() => handleViewContact(contact)}>
                      <MoreIcon />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="contacts-footer">
        <div className="contacts-info">
          Showing {filteredContacts.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredContacts.length)} of {filteredContacts.length} entries
        </div>
        <div className="contacts-pagination">
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

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Contact</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddContact} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={contactForm.firstName}
                    onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={contactForm.lastName}
                    onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <div className="input-with-type">
                    <select
                      value={contactForm.phoneType}
                      onChange={(e) => setContactForm({ ...contactForm, phoneType: e.target.value })}
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <div className="input-with-type">
                    <select
                      value={contactForm.emailType}
                      onChange={(e) => setContactForm({ ...contactForm, emailType: e.target.value })}
                    >
                      <option value="Work">Work</option>
                      <option value="Personal">Personal</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Owner</label>
                <select
                  value={contactForm.owner}
                  onChange={(e) => setContactForm({ ...contactForm, owner: e.target.value })}
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
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Detail Modal with Deals */}
      {selectedContact && (
        <div className="modal-overlay" onClick={() => setSelectedContact(null)}>
          <div className="modal-content contact-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Contact Details</h2>
              <button className="modal-close" onClick={() => setSelectedContact(null)}>×</button>
            </div>
            <div className="contact-detail-content">
              <div className="contact-info-section">
                <div className="contact-header-info">
                  <div
                    className="contact-detail-avatar"
                    style={{ backgroundColor: getAvatarColor(selectedContact.name || `${selectedContact.first_name} ${selectedContact.last_name}`) }}
                  >
                    {getInitials(selectedContact.name || `${selectedContact.first_name} ${selectedContact.last_name}`)}
                  </div>
                  <div>
                    <h3>{selectedContact.name || `${selectedContact.first_name} ${selectedContact.last_name}`}</h3>
                    {selectedContact.company && (
                      <p className="contact-company-detail">{selectedContact.company}</p>
                    )}
                    <p className="contact-owner">
                      Owner: {selectedContact.owner_id ? getOwnerName(selectedContact.owner_id) : 'Unassigned'}
                    </p>
                  </div>
                </div>
                <div className="contact-details-grid">
                  <div className="detail-item">
                    <label>Phone</label>
                    <p>{selectedContact.phone ? `${selectedContact.phone_type || 'Work'}: ${selectedContact.phone}` : '-'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <p>{selectedContact.email ? `${selectedContact.email_type || 'Work'}: ${selectedContact.email}` : '-'}</p>
                  </div>
                  {selectedContact.company && (
                    <div className="detail-item">
                      <label>Company</label>
                      <p>{selectedContact.company}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="deals-section">
                <h4>Deals ({contactDeals.length})</h4>
                {contactDeals.length === 0 ? (
                  <div className="no-deals">
                    <p>No deals associated with this contact</p>
                  </div>
                ) : (
                  <div className="deals-list">
                    {contactDeals.map(deal => (
                      <div key={deal.id} className="deal-card">
                        <div className="deal-header">
                          <div className="deal-name">{deal.name}</div>
                          <div className={`deal-status ${deal.status.toLowerCase().replace(' ', '-')}`}>
                            {deal.status}
                          </div>
                        </div>
                        <div className="deal-details">
                          <div className="deal-info">
                            <span className="deal-label">Value:</span>
                            <span className="deal-value">${deal.value?.toLocaleString() || '0'}</span>
                          </div>
                          {deal.company && (
                            <div className="deal-info">
                              <span className="deal-label">Company:</span>
                              <span>{deal.company}</span>
                            </div>
                          )}
                          {deal.location && (
                            <div className="deal-info">
                              <span className="deal-label">Location:</span>
                              <span>{deal.location}</span>
                            </div>
                          )}
                        </div>
                        <div className="deal-footer">
                          <span className="deal-date">Created: {new Date(deal.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contacts;

