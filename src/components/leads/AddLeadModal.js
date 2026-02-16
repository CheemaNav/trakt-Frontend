import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './AddLeadModal.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function AddLeadModal({ onClose, onSave, initialData, isEditMode, selectedPipeline, selectedStageId }) {
  const [formData, setFormData] = useState({
    contactPerson: initialData?.name || '',
    organization: initialData?.company || '',
    title: initialData?.title || initialData?.company || initialData?.name || '',
    value: initialData?.value || '',
    pipeline: 'Default Pipeline',
    country: initialData?.country || initialData?.deal_country || initialData?.location || 'United States',
    currency: initialData?.currency || initialData?.deal_currency || 'USD',
    pipelineStage: initialData?.status || 'Not Contacted',
    expectedCloseDate: '',
    owner: '',
    sourceChannel: 'Manual',
    phone: initialData?.phone || '',
    phoneType: 'Work',
    email: initialData?.email || '',
    emailType: 'Work',
    description: '',
    leadType: initialData?.lead_type || initialData?.leadType || ''
  });

  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isAddingOrganization, setIsAddingOrganization] = useState(false);
  const [contactPersons, setContactPersons] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState(null);
  const [pipelineStages, setPipelineStages] = useState([]);
  const [currentStageId, setCurrentStageId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Map country to currency for convenience
  const countryCurrencyMap = {
    'United States': 'USD',
    'United Kingdom': 'GBP',
    Canada: 'CAD',
    Australia: 'AUD',
    Germany: 'EUR',
    France: 'EUR',
    Japan: 'JPY',
    China: 'CNY',
    India: 'INR',
    Brazil: 'BRL',
    Russia: 'RUB',
    'South Korea': 'KRW',
    Mexico: 'MXN',
    Netherlands: 'EUR',
    Switzerland: 'CHF',
    Spain: 'EUR',
    Italy: 'EUR',
    Belgium: 'EUR',
    Sweden: 'SEK',
    Norway: 'NOK',
    Denmark: 'DKK',
    Finland: 'EUR',
    Poland: 'PLN',
    Turkey: 'TRY',
    'Saudi Arabia': 'SAR',
    'United Arab Emirates': 'AED',
    Singapore: 'SGD',
    Malaysia: 'MYR',
    Thailand: 'THB',
    Indonesia: 'IDR',
    Philippines: 'PHP',
    Vietnam: 'VND',
    Argentina: 'ARS',
    Chile: 'CLP',
    Colombia: 'COP',
    'South Africa': 'ZAR',
    Egypt: 'EGP',
    Nigeria: 'NGN',
    Israel: 'ILS',
    'New Zealand': 'NZD',
    Ireland: 'EUR',
    Portugal: 'EUR',
    Greece: 'EUR',
    Austria: 'EUR',
    'Czech Republic': 'CZK',
    Hungary: 'HUF',
    Romania: 'RON',
    Ukraine: 'UAH',
    Croatia: 'EUR',
    Slovakia: 'EUR',
    Slovenia: 'EUR',
    Bulgaria: 'BGN',
    Iceland: 'ISK',
    Luxembourg: 'EUR'
  };

  // Fetch stages for a pipeline
  const fetchStagesForPipeline = async (pipelineId, defaultStageId = null) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/pipelines/${pipelineId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.pipeline && data.pipeline.stages) {
          setPipelineStages(data.pipeline.stages);
          // Set default stage (from parameter, prop, or first stage)
          const stageToSelect = defaultStageId || selectedStageId || (data.pipeline.stages.length > 0 ? data.pipeline.stages[0].id : null);
          if (stageToSelect && data.pipeline.stages.find(s => s.id === stageToSelect)) {
            setCurrentStageId(stageToSelect);
            const selectedStage = data.pipeline.stages.find(s => s.id === stageToSelect);
            if (selectedStage) {
              setFormData(prev => ({ ...prev, pipelineStage: selectedStage.name }));
            }
          } else if (data.pipeline.stages.length > 0) {
            setCurrentStageId(data.pipeline.stages[0].id);
            setFormData(prev => ({ ...prev, pipelineStage: data.pipeline.stages[0].name }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching pipeline stages:', error);
    }
  };

  // Fetch contacts, organizations, users, and pipelines
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = localStorage.getItem('token');
        const authHeaders = { 'Authorization': `Bearer ${token}` };

        // Fetch contacts (global per user)
        const contactsResponse = await fetch(`${API_URL}/contacts`, { headers: authHeaders });
        const leadsResponse = await fetch(`${API_URL}/leads`, { headers: authHeaders });

        const contactNames = new Set();

        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json();
          const contactsList = contactsData.contacts || [];
          contactsList.forEach(c => {
            const nameFromParts = [c.first_name, c.last_name].filter(Boolean).join(' ').trim();
            const fallbackName = c.name || c.email || '';
            const finalName = nameFromParts || fallbackName;
            if (finalName) contactNames.add(finalName);
          });
        } else {
          console.error('Failed to fetch contacts');
        }

        // Also include lead names as contacts fallback (matches Contacts page behavior)
        if (leadsResponse.ok) {
          const leadsData = await leadsResponse.json();
          const leadsList = leadsData.leads || [];
          leadsList.forEach(lead => {
            const name = lead.name || '';
            if (name) contactNames.add(name);
          });
        }

        setContactPersons(Array.from(contactNames));

        // Fetch organizations (global per user)
        const orgResponse = await fetch(`${API_URL}/organizations`, { headers: authHeaders });
        if (orgResponse.ok) {
          const orgData = await orgResponse.json();
          const orgList = orgData.organizations || [];
          const orgNames = [...new Set(orgList.map(o => o.name).filter(Boolean))];
          setOrganizations(orgNames);
        } else {
          console.error('Failed to fetch organizations');
        }

        // Fetch users for owner dropdown
        const usersResponse = await fetch(`${API_URL}/users`, { headers: authHeaders });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.users || []);

          // Set default owner to current user if not in edit mode
          if (!isEditMode && usersData.users && usersData.users.length > 0) {
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const defaultUser = usersData.users.find(u => u.id === currentUser.id) || usersData.users[0];
            if (defaultUser) {
              setFormData(prev => ({ ...prev, owner: defaultUser.id.toString() }));
            }
          }
        }

        // Fetch pipelines
        const pipelinesResponse = await fetch(`${API_URL}/pipelines`, { headers: authHeaders });
        if (pipelinesResponse.ok) {
          const pipelinesData = await pipelinesResponse.json();
          const pipelinesList = pipelinesData.pipelines || [];
          setPipelines(pipelinesList);

          // Set default pipeline (from props or default pipeline or first pipeline)
          if (selectedPipeline) {
            setSelectedPipelineId(selectedPipeline.id);
            // Fetch stages for the selected pipeline
            fetchStagesForPipeline(selectedPipeline.id, selectedStageId);
          } else if (pipelinesList.length > 0) {
            const defaultPipeline = pipelinesList.find(p => p.is_default === 1) || pipelinesList[0];
            setSelectedPipelineId(defaultPipeline.id);
            setFormData(prev => ({ ...prev, pipeline: defaultPipeline.name }));
            // Fetch stages for the default pipeline
            fetchStagesForPipeline(defaultPipeline.id);
          }
        }
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    fetchOptions();
  }, [isEditMode, selectedPipeline, selectedStageId]);

  // Handle pipeline change
  const handlePipelineChange = (e) => {
    const pipelineId = parseInt(e.target.value);
    setSelectedPipelineId(pipelineId);
    const selectedPipeline = pipelines.find(p => p.id === pipelineId);
    if (selectedPipeline) {
      setFormData(prev => ({ ...prev, pipeline: selectedPipeline.name }));
      fetchStagesForPipeline(pipelineId);
      // Reset stage selection
      setCurrentStageId(null);
      setFormData(prev => ({ ...prev, pipelineStage: '' }));
    }
  };

  // Handle stage change
  const handleStageChange = (stageId, stageName) => {
    setCurrentStageId(stageId);
    setFormData(prev => ({ ...prev, pipelineStage: stageName }));
  };

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      const initialCountry = initialData.country || initialData.deal_country || initialData.location || 'United States';
      const initialCurrency = initialData.currency || initialData.deal_currency || countryCurrencyMap[initialCountry] || 'USD';

      setFormData({
        contactPerson: initialData.name || '',
        organization: initialData.company || '',
        title: initialData.title || initialData.company || initialData.name || '',
        value: initialData.value || '',
        pipeline: initialData.pipeline_name || 'Default Pipeline',
        country: initialCountry,
        currency: initialCurrency,
        pipelineStage: initialData.stage_name || initialData.status || 'Not Contacted',
        expectedCloseDate: '',
        owner: initialData.owner_id ? initialData.owner_id.toString() : '',
        sourceChannel: 'Manual',
        phone: initialData.phone || '',
        phoneType: 'Work',
        email: initialData.email || '',
        emailType: 'Work',
        description: ''
      });

      // Set pipeline and stage IDs if available
      if (initialData.pipeline_id) {
        setSelectedPipelineId(initialData.pipeline_id);
        // Fetch stages for this pipeline
        fetchStagesForPipeline(initialData.pipeline_id, initialData.stage_id);
      }
      if (initialData.stage_id) {
        setCurrentStageId(initialData.stage_id);
      }

      // Reset the "Add New" states when modal opens
      setIsAddingContact(false);
      setIsAddingOrganization(false);
    }
  }, [initialData]);

  // Add overflow hidden to body when modal opens
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'country') {
      const currency = countryCurrencyMap[value] || formData.currency || 'USD';
      setFormData(prev => ({ ...prev, country: value, currency }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      // Map fields properly: name comes from contactPerson or title, company from organization
      const leadName = formData.contactPerson || formData.title || 'Untitled Deal';
      const leadCompany = formData.organization || '';

      const leadData = {
        name: leadName,
        company: leadCompany,
        email: formData.email || '',
        phone: formData.phone || '',
        value: parseFloat(formData.value) || 0,
        location: formData.country || 'United States',
        country: formData.country || 'United States',
        currency: formData.currency || countryCurrencyMap[formData.country] || 'USD',
        status: formData.pipelineStage || 'Not Contacted',
        owner_id: formData.owner ? parseInt(formData.owner) : null,
        title: formData.title || leadName,
        pipeline_id: selectedPipelineId || selectedPipeline?.id || null,
        stage_id: currentStageId || selectedStageId || null,
        lead_type: formData.leadType || null
      };

      console.log('[AddLeadModal] Sending leadData with lead_type:', leadData.lead_type, 'Full leadData:', leadData);

      await onSave(leadData);
      setSaving(false);
      // Close modal after successful save
      onClose();
    } catch (error) {
      console.error('Error saving lead:', error);
      setError('Failed to save lead. Please try again.');
      setSaving(false);
    }
  };

  // Use dynamic pipeline stages or fallback to empty array
  const stages = pipelineStages.length > 0
    ? pipelineStages.map(stage => ({
      id: stage.id,
      label: stage.name,
      color: stage.color || '#1a73e8'
    }))
    : [];

  const currentStageIndex = currentStageId
    ? stages.findIndex(s => s.id === currentStageId)
    : -1;

  const modalMarkup = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content sidebar-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Edit Deal' : 'Add Deal'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Lead Contact Detail Section */}
          <div className="form-section">
            <h3 className="section-title">Lead Contact Detail</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Contact Person *</label>
                {!isAddingContact ? (
                  <>
                    <select name="contactPerson" value={formData.contactPerson} onChange={handleChange}>
                      <option value="">Select a contact person</option>
                      {contactPersons.map((contact, index) => (
                        <option key={index} value={contact}>{contact}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsAddingContact(true);
                      }}
                    >
                      + Add New
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      placeholder="Enter contact person name"
                      required
                    />
                    <button
                      type="button"
                      className="link-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsAddingContact(false);
                        setFormData({ ...formData, contactPerson: '' });
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>

              <div className="form-group">
                <label>Organization</label>
                {!isAddingOrganization ? (
                  <>
                    <select name="organization" value={formData.organization} onChange={handleChange}>
                      <option value="">Select an organization</option>
                      {organizations.map((org, index) => (
                        <option key={index} value={org}>{org}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsAddingOrganization(true);
                        setFormData({ ...formData, organization: '' });
                      }}
                    >
                      + Add New
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      placeholder="Enter organization name"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="link-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsAddingOrganization(false);
                        setFormData({ ...formData, organization: '' });
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="form-group full-width">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Deal title"
                required
              />
            </div>

            <div className="form-group">
              <label>Value</label>
              <input
                type="text"
                name="value"
                value={formData.value}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Lead Type</label>
              <select
                name="leadType"
                value={formData.leadType}
                onChange={handleChange}
              >
                <option value="">Select Lead Type (Optional)</option>
                <option value="hot">🔥 Hot Lead</option>
                <option value="warm">🌤 Warm Lead</option>
                <option value="cold">❄️ Cold Lead</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Pipeline *</label>
              <select
                name="pipeline"
                value={selectedPipelineId || ''}
                onChange={handlePipelineChange}
                required
              >
                <option value="">Select a pipeline</option>
                {pipelines.map((pipeline) => (
                  <option key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label>Country & Currency *</label>
              <select name="country" value={formData.country} onChange={handleChange} required>
                <option value="">Select a country</option>
                <option value="United States">🇺🇸 United States (USD)</option>
                <option value="United Kingdom">🇬🇧 United Kingdom (GBP)</option>
                <option value="Canada">🇨🇦 Canada (CAD)</option>
                <option value="Australia">🇦🇺 Australia (AUD)</option>
                <option value="Germany">🇩🇪 Germany (EUR)</option>
                <option value="France">🇫🇷 France (EUR)</option>
                <option value="Japan">🇯🇵 Japan (JPY)</option>
                <option value="China">🇨🇳 China (CNY)</option>
                <option value="India">🇮🇳 India (INR)</option>
                <option value="Brazil">🇧🇷 Brazil (BRL)</option>
                <option value="Russia">🇷🇺 Russia (RUB)</option>
                <option value="South Korea">🇰🇷 South Korea (KRW)</option>
                <option value="Mexico">🇲🇽 Mexico (MXN)</option>
                <option value="Netherlands">🇳🇱 Netherlands (EUR)</option>
                <option value="Switzerland">🇨🇭 Switzerland (CHF)</option>
                <option value="Spain">🇪🇸 Spain (EUR)</option>
                <option value="Italy">🇮🇹 Italy (EUR)</option>
                <option value="Belgium">🇧🇪 Belgium (EUR)</option>
                <option value="Sweden">🇸🇪 Sweden (SEK)</option>
                <option value="Norway">🇳🇴 Norway (NOK)</option>
                <option value="Denmark">🇩🇰 Denmark (DKK)</option>
                <option value="Finland">🇫🇮 Finland (EUR)</option>
                <option value="Poland">🇵🇱 Poland (PLN)</option>
                <option value="Turkey">🇹🇷 Turkey (TRY)</option>
                <option value="Saudi Arabia">🇸🇦 Saudi Arabia (SAR)</option>
                <option value="United Arab Emirates">🇦🇪 United Arab Emirates (AED)</option>
                <option value="Singapore">🇸🇬 Singapore (SGD)</option>
                <option value="Malaysia">🇲🇾 Malaysia (MYR)</option>
                <option value="Thailand">🇹🇭 Thailand (THB)</option>
                <option value="Indonesia">🇮🇩 Indonesia (IDR)</option>
                <option value="Philippines">🇵🇭 Philippines (PHP)</option>
                <option value="Vietnam">🇻🇳 Vietnam (VND)</option>
                <option value="Argentina">🇦🇷 Argentina (ARS)</option>
                <option value="Chile">🇨🇱 Chile (CLP)</option>
                <option value="Colombia">🇨🇴 Colombia (COP)</option>
                <option value="South Africa">🇿🇦 South Africa (ZAR)</option>
                <option value="Egypt">🇪🇬 Egypt (EGP)</option>
                <option value="Nigeria">🇳🇬 Nigeria (NGN)</option>
                <option value="Israel">🇮🇱 Israel (ILS)</option>
                <option value="New Zealand">🇳🇿 New Zealand (NZD)</option>
                <option value="Ireland">🇮🇪 Ireland (EUR)</option>
                <option value="Portugal">🇵🇹 Portugal (EUR)</option>
                <option value="Greece">🇬🇷 Greece (EUR)</option>
                <option value="Austria">🇦🇹 Austria (EUR)</option>
                <option value="Czech Republic">🇨🇿 Czech Republic (CZK)</option>
                <option value="Hungary">🇭🇺 Hungary (HUF)</option>
                <option value="Romania">🇷🇴 Romania (RON)</option>
                <option value="Ukraine">🇺🇦 Ukraine (UAH)</option>
                <option value="Croatia">🇭🇷 Croatia (EUR)</option>
                <option value="Slovakia">🇸🇰 Slovakia (EUR)</option>
                <option value="Slovenia">🇸🇮 Slovenia (EUR)</option>
                <option value="Bulgaria">🇧🇬 Bulgaria (BGN)</option>
                <option value="Iceland">🇮🇸 Iceland (ISK)</option>
                <option value="Luxembourg">🇱🇺 Luxembourg (EUR)</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Pipeline Stage *</label>
              {stages.length > 0 ? (
                <div className="pipeline-stages">
                  {stages.map((stage, index) => (
                    <div
                      key={stage.id}
                      className={`stage-segment ${index <= currentStageIndex ? 'completed' : ''}`}
                      onClick={() => handleStageChange(stage.id, stage.label)}
                      style={{
                        backgroundColor: index <= currentStageIndex ? stage.color : '#e0e0e0',
                        color: index <= currentStageIndex ? '#fff' : '#666'
                      }}
                    >
                      {index > 0 && <div className="segment-divider" />}
                      <span className="stage-label">{stage.label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '12px', color: '#999', fontSize: '0.9rem' }}>
                  {selectedPipelineId ? 'Loading stages...' : 'Please select a pipeline first'}
                </div>
              )}
            </div>

            <div className="form-group full-width">
              <label>Expected Close Date</label>
              <input
                type="date"
                name="expectedCloseDate"
                value={formData.expectedCloseDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Owner</label>
              <select name="owner" value={formData.owner} onChange={handleChange}>
                <option value="">Select owner</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id.toString()}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label>Source Channel</label>
              <select name="sourceChannel" value={formData.sourceChannel} onChange={handleChange}>
                <option value="Manual">Manual</option>
                <option value="Web">Web</option>
                <option value="Referral">Referral</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add deal description"
                rows="3"
              />
            </div>
          </div>

          {/* Person Section */}
          <div className="form-section">
            <h3 className="section-title">Person</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                />
              </div>

              <div className="form-group">
                <label>Phone Type</label>
                <select name="phoneType" value={formData.phoneType} onChange={handleChange}>
                  <option value="Work">Work</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Home">Home</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                />
              </div>

              <div className="form-group">
                <label>Email Type</label>
                <select name="emailType" value={formData.emailType} onChange={handleChange}>
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
            </div>

            <div className="form-group link-buttons-group">
              <button type="button" className="link-btn" onClick={(e) => e.preventDefault()}>
                + Add Phone
              </button>
              <button type="button" className="link-btn" onClick={(e) => e.preventDefault()}>
                + Add Email
              </button>
            </div>
          </div>

          {error && (
            <div className="form-error" style={{ color: '#ef4444', marginBottom: '16px', padding: '12px', background: '#fee2e2', borderRadius: '6px' }}>
              {error}
            </div>
          )}
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(modalMarkup, document.body);
}

export default AddLeadModal;

