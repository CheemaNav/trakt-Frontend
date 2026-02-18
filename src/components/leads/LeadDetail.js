import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useFetchWithPolling from '../../hooks/useFetchWithPolling';
import './LeadDetail.css';
import { History, Notes, Call, Files, Products, Gmail, Meetings } from './leadDetailTabs';

const BackArrowIcon = (props) => (
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
    <path d="M15 18l-6-6 6-6" />
    <path d="M9 12h12" />
  </svg>
);

const LocationIcon = (props) => (
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
    <path d="M12 21s-6-5.33-6-10a6 6 0 1 1 12 0c0 4.67-6 10-6 10Z" />
    <circle cx="12" cy="11" r="2.5" />
  </svg>
);

const TimelineIcon = (props) => (
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
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <path d="M5 8h14v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z" />
    <path d="M10 12h4" />
  </svg>
);

const MoneyIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M12 1 3 5v6c0 5.25 3.4 10.3 9 12 5.6-1.7 9-6.75 9-12V5l-9-4Z" />
    <path d="M9 11a3 3 0 0 0 3 3 3 3 0 1 0 0-6 3 3 0 0 0-3 3Z" />
  </svg>
);

const BuildingIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M4 21h16" />
    <path d="M5 21V5a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v16" />
    <path d="M9 21v-4h6v4" />
    <path d="M9 9h6" />
    <path d="M9 12h6" />
  </svg>
);

const PersonIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <circle cx="12" cy="7.5" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </svg>
);

const TagIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M3 11.5 11.5 3a1.5 1.5 0 0 1 2.12 0L21 10.38a1.5 1.5 0 0 1 0 2.12L12.5 21 3 11.5Z" />
    <path d="M7 7h.01" />
  </svg>
);

const CalendarIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
  </svg>
);

const PlusIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const ActivityIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M3 12h4l3 8 4-16 3 8h4" />
  </svg>
);

const NoteIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M3 3h14l4 4v14H3V3Z" />
    <path d="M17 3v4h4" />
  </svg>
);

const CallIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 8.63 19 19.5 19.5 0 0 1 2.6 12.4a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 1.53 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L5.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2Z" />
  </svg>
);

const FileIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" />
  </svg>
);

const ProductIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="m7.5 4.27 4.5-2.49 4.5 2.49" />
    <path d="M7.5 4.27v4.99c0 .9.5 1.73 1.3 2.16l3.2 1.64 3.2-1.64c.8-.43 1.3-1.26 1.3-2.16V4.27" />
    <path d="m7.5 9.26 4.5 2.49 4.5-2.49" />
    <path d="M12 11.75v6.5" />
    <path d="m7.5 15.75 4.5 2.5 4.5-2.5" />
  </svg>
);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const DEFAULT_STAGES = [
  { id: 'Contacted', label: 'Contacted', name: 'Contacted', color: '#fbbc04', days: 0 },
  { id: 'Not Contacted', label: 'Not Contacted', name: 'Not Contacted', color: '#1a73e8', days: 0 },
  { id: 'Closed', label: 'Closed', name: 'Closed', color: '#34a853', days: 0 },
  { id: 'Lost', label: 'Lost', name: 'Lost', color: '#ea4335', days: 0 }
];

const mapStatusToStageId = (status) => {
  const normalized = (status || '').toString().toLowerCase();
  if (normalized === 'contacted') return 'Contacted';
  if (normalized === 'closed' || normalized === 'won') return 'Closed';
  if (normalized === 'lost' || normalized === 'trashed') return 'Lost';
  // Default any other / open statuses to Not Contacted
  return 'Not Contacted';
};

const TAB_CONFIG = [
  { id: 'Timeline', label: 'Activity', Icon: ActivityIcon },
  { id: 'Notes', label: 'Notes', Icon: NoteIcon },
  { id: 'Call', label: 'Call', Icon: CallIcon },
  { id: 'Files', label: 'Files', Icon: FileIcon },
  { id: 'Products', label: 'Products', Icon: ProductIcon },
  { id: 'Gmail', label: 'Gmail', Icon: PersonIcon },
  { id: 'Meetings', label: 'Meetings', Icon: CalendarIcon }
];

function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Only poll the lead itself - tab components fetch their own data internally
  const { data: leadWrapper, loading: leadLoading, error: leadError, refresh: refreshLead } = useFetchWithPolling(`${API_URL}/leads/${id}`, 30000);

  const lead = leadWrapper?.lead || null;
  const loading = leadLoading;

  // Tab counts - updated by child component callbacks
  const [tabCounts, setTabCounts] = useState({
    Notes: 0,
    Call: 0,
    Files: 0,
    Products: 0,
    Gmail: 0,
    Timeline: 0,
    Meetings: 0
  });

  const [activeTab, setActiveTab] = useState('Timeline');
  const [mountedTabs, setMountedTabs] = useState(new Set(['Timeline']));
  const [users, setUsers] = useState([]);
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [notification, setNotification] = useState(null);
  const [pipelineStages, setPipelineStages] = useState([]);
  const [showLostModal, setShowLostModal] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [lostSubmitting, setLostSubmitting] = useState(false);
  const [isSummaryEditing, setIsSummaryEditing] = useState(false);
  const [summaryForm, setSummaryForm] = useState({
    value: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    expected_close_date: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch tab counts on mount (lightweight - just counts, no full tab mounting)
  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };
    const fetchCount = async (url, key) => {
      try {
        const res = await fetch(url, { headers });
        if (res.ok) {
          const data = await res.json();
          const arr = data[key] || [];
          return Array.isArray(arr) ? arr.length : 0;
        }
      } catch (e) { /* ignore */ }
      return 0;
    };

    Promise.all([
      fetchCount(`${API_URL}/leads/${id}/notes`, 'notes'),
      fetchCount(`${API_URL}/leads/${id}/calls`, 'calls'),
      fetchCount(`${API_URL}/leads/${id}/files`, 'files'),
      fetchCount(`${API_URL}/leads/${id}/products`, 'products'),
      fetchCount(`${API_URL}/leads/${id}/emails`, 'emails'),
    ]).then(([notes, calls, files, products, emails]) => {
      setTabCounts(prev => ({ ...prev, Notes: notes, Call: calls, Files: files, Products: products, Gmail: emails }));
    });
  }, [id]);

  // Handle lead errors
  useEffect(() => {
    if (leadError) {
      if (leadError.status === 404) {
        setNotification({ type: 'error', message: 'Lead not found' });
        setTimeout(() => navigate('/leads'), 2000);
      } else if (leadError.status === 401) {
        navigate('/login');
      } else {
        setNotification({ type: 'error', message: leadError.message || 'Failed to fetch lead' });
      }
    }
  }, [leadError, navigate]);

  useEffect(() => {
    if (lead) {
      setSummaryForm({
        value: lead.value || '',
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        expected_close_date: lead.expected_close_date || ''
      });
    }
  }, [lead]);



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOwnerDropdown && !event.target.closest('.owner-dropdown-container')) {
        setShowOwnerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOwnerDropdown]);

  // Only fetch pipeline stages if pipeline_id changes and is valid, and never update lead in fetchPipelineStages
  const lastPipelineIdRef = React.useRef(null);
  useEffect(() => {
    if (lead && lead.pipeline_id && lead.pipeline_id !== lastPipelineIdRef.current) {
      lastPipelineIdRef.current = lead.pipeline_id;
      fetchPipelineStages(lead.pipeline_id);
    }
  }, [lead && lead.pipeline_id]);

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









  const fetchPipelineStages = async (pipelineId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !pipelineId) {
        setPipelineStages([]);
        return;
      }
      const response = await fetch(`${API_URL}/pipelines/${pipelineId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.pipeline?.stages?.length) {
          const formatted = data.pipeline.stages.map((s) => ({
            id: s.id,
            label: s.name,
            name: s.name,
            color: s.color || '#1a73e8',
            probability: s.probability || 0
          }));
          setPipelineStages(formatted);
        } else {
          setPipelineStages([]);
        }
      } else {
        setPipelineStages([]);
      }
    } catch (e) {
      console.error('Error fetching pipeline stages:', e);
      setPipelineStages([]);
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

  const formatShortDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };


  const formatValue = (value, currency = 'USD') => {
    const safeCurrency = currency || 'USD';
    if (!value || value === 0) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: safeCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(0);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getRandomColor = () => {
    const colors = ['#3b82f6', '#ef4444', '#fbbf24', '#8b5cf6', '#10b981', '#06b6d4'];
    return colors[id % colors.length];
  };

  const updateLead = async (updates, showNotification = false) => {
    setUpdating(true);
    const previousStatus = lead?.status;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.lead) {
          // Preserve the stage the user selected for UI even if backend normalizes status
          const mergedLead = { ...data.lead, status: updates.status || data.lead.status };
          // Preserve the stage the user selected for UI even if backend normalizes status
          // const mergedLead = { ...data.lead, status: updates.status || data.lead.status };
          // setLead(mergedLead); // Replaced by independent polling refresh
          await refreshLead();
          if (showNotification && updates.status) {
            const statusMap = {
              'Closed': 'won',
              'Lost': 'lost'
            };
            const newStatus = statusMap[updates.status] || updates.status.toLowerCase();
            const oldStatus = previousStatus ? previousStatus.toLowerCase() : 'open';
            setNotification({
              type: updates.status === 'Closed' ? 'won' : 'lost',
              message: `Changed status from ${oldStatus} to ${newStatus}`
            });
          }
        } else {
          await refreshLead(); // Refresh if lead not in response
        }
        return true;
      } else {
        const error = await response.json();
        setNotification({
          type: 'error',
          message: error.error || 'Failed to update lead'
        });
        return false;
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      setNotification({
        type: 'error',
        message: 'Error updating lead'
      });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const handleStageClick = async (stage) => {
    const currentStageId = lead?.stage_id || mapStatusToStageId(lead?.status);
    if (updating || stage.id === currentStageId) return;
    await updateLead({ stage_id: stage.id, status: stage.name || stage.label });
  };

  const findStageByName = (name) => {
    const target = (name || '').toLowerCase();
    return stagesToRender.find(
      (s) =>
        s.name?.toLowerCase() === target ||
        s.label?.toLowerCase() === target
    );
  };

  const handleWon = async () => {
    const closedStage = findStageByName('Closed');
    await updateLead(
      { stage_id: closedStage?.id, status: closedStage?.name || 'Closed' },
      true
    );
  };

  const handleLostClick = () => {
    setShowLostModal(true);
  };

  const handleLostSubmit = async () => {
    const lostStage = findStageByName('Lost');
    setLostSubmitting(true);
    const updated = await updateLead(
      { stage_id: lostStage?.id, status: lostStage?.name || 'Lost' },
      true
    );
    if (updated && lostReason.trim()) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/leads/${id}/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content: `Lost Reason: ${lostReason.trim()}` })
        });
      } catch (e) {
        console.error('Error saving lost reason note:', e);
      }
    }
    setLostSubmitting(false);
    setShowLostModal(false);
    setLostReason('');
  };

  const handleLostCancel = () => {
    setShowLostModal(false);
    setLostReason('');
  };

  const handleReopen = async () => {
    const defaultStage = pipelineStages[0] || DEFAULT_STAGES[0];
    if (!defaultStage) return;
    await updateLead({
      stage_id: defaultStage.id,
      status: defaultStage.name || defaultStage.label || 'Not Contacted'
    }, true);
  };

  const handleOwnerSelect = async (ownerId) => {
    setShowOwnerDropdown(false);
    await updateLead({ owner_id: ownerId });
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('[LeadDetail] Deleting lead:', id);

      const response = await fetch(`${API_URL}/leads/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[LeadDetail] Lead deleted successfully:', data);
        navigate('/leads');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete lead' }));
        console.error('[LeadDetail] Delete error response:', errorData, 'Status:', response.status);
        setNotification({
          type: 'error',
          message: errorData.error || 'Failed to delete lead'
        });
      }
    } catch (error) {
      console.error('[LeadDetail] Error deleting lead:', error);
      setNotification({
        type: 'error',
        message: 'Error deleting lead. Please try again.'
      });
    }
  };

  const handleSummaryFieldChange = (field, value) => {
    setSummaryForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSummarySave = async () => {
    const updates = {
      value: summaryForm.value ? Number(summaryForm.value) : 0,
      name: summaryForm.name,
      email: summaryForm.email,
      phone: summaryForm.phone,
      company: summaryForm.company,
      expected_close_date: summaryForm.expected_close_date || null
    };
    const success = await updateLead(updates);
    if (success) {
      setIsSummaryEditing(false);
      // Force refresh to pick up latest data
      await refreshLead();
    }
  };

  const handleSummaryCancel = () => {
    if (lead) {
      setSummaryForm({
        value: lead.value || '',
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        expected_close_date: lead.expected_close_date || ''
      });
    }
    setIsSummaryEditing(false);
  };

  const toDateInputValue = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  };

  const closeNotification = () => {
    setNotification(null);
  };

  // Auto-close notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const getOwnerName = () => {
    if (lead?.owner_name) {
      return lead.owner_name.length > 12 ? lead.owner_name.substring(0, 12) : lead.owner_name;
    }
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    return currentUser.name ? (currentUser.name.length > 12 ? currentUser.name.substring(0, 12) : currentUser.name) : 'Navdeep Sin';
  };

  if (loading || !lead) {
    return (
      <div className="lead-detail-loading">
        <p>Loading...</p>
      </div>
    );
  }

  const stagesToRender = pipelineStages.length ? pipelineStages : DEFAULT_STAGES;
  const currentStageId =
    lead.stage_id ||
    stagesToRender.find((s) => s.name?.toLowerCase() === (lead.stage_name || '').toLowerCase())?.id ||
    mapStatusToStageId(lead.status);
  const currentStageIndex = stagesToRender.findIndex((s) => s.id === currentStageId || s.name === currentStageId);

  const isLostStatus = () => {
    const normalizedStatus = (lead.status || '').toLowerCase();
    const normalizedStageName = (lead.stage_name || '').toLowerCase();
    return normalizedStatus === 'lost' || normalizedStatus === 'trashed' || normalizedStageName === 'lost';
  };

  // Build history items from lead data
  const historyItems = [
    // Add stage change if updated
    ...(lead.updated_at && lead.updated_at !== lead.created_at ? [{
      id: 'stage-change',
      title: `Stage changed to ${lead.status || 'Not Contacted'}`,
      timestamp: formatDate(lead.updated_at),
      user: lead.owner_name || 'Navdeep Singh',
      type: 'activity'
    }] : []),
    // Add deal created
    {
      id: 'deal-created',
      title: `Deal created`,
      timestamp: formatDate(lead.created_at),
      user: lead.owner_name || 'Navdeep Singh',
      type: 'activity'
    },
  ].sort((a, b) => {
    // Sort by timestamp, newest first
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return dateB - dateA;
  });

  // Render all tab contents, only show the active one (preserve state)
  const tabContent = {
    Timeline: <History leadId={id} />,
    Notes: <Notes leadId={id} onNotesChange={(updatedNotes) => {
      setTabCounts(prev => ({ ...prev, Notes: Array.isArray(updatedNotes) ? updatedNotes.length : 0 }));
    }} />,
    Call: <Call leadId={id} onCallsChange={(updatedCalls) => {
      setTabCounts(prev => ({ ...prev, Call: Array.isArray(updatedCalls) ? updatedCalls.length : 0 }));
    }} />,
    Files: <Files leadId={id} onFilesChange={(updatedFiles) => {
      setTabCounts(prev => ({ ...prev, Files: Array.isArray(updatedFiles) ? updatedFiles.length : 0 }));
    }} />,
    Products: <Products leadId={id} />,
    Gmail: <Gmail leadId={id} onEmailsChange={(emailCount) => {
      setTabCounts(prev => ({ ...prev, Gmail: typeof emailCount === 'number' ? emailCount : 0 }));
    }} />,
    Meetings: <Meetings leadEmail={lead?.email} leadName={lead?.name} leadId={id} />
  };

  const summaryCards = [
    {
      icon: MoneyIcon,
      label: 'Deal value',
      value: formatValue(summaryForm.value || lead.value, lead.currency || 'USD'),
      input: (
        <input
          type="number"
          min="0"
          step="1"
          value={summaryForm.value}
          onChange={(e) => handleSummaryFieldChange('value', e.target.value)}
          className="summary-input"
        />
      ),
    },
    {
      icon: PersonIcon,
      label: 'Contact person',
      value: summaryForm.name || 'Add contact',
      subitems: isSummaryEditing
        ? [
          <input
            key="name"
            type="text"
            value={summaryForm.name}
            onChange={(e) => handleSummaryFieldChange('name', e.target.value)}
            placeholder="Name"
            className="summary-input"
          />,
          <input
            key="email"
            type="email"
            value={summaryForm.email}
            onChange={(e) => handleSummaryFieldChange('email', e.target.value)}
            placeholder="Email"
            className="summary-input"
          />,
          <input
            key="phone"
            type="tel"
            value={summaryForm.phone}
            onChange={(e) => handleSummaryFieldChange('phone', e.target.value)}
            placeholder="Phone"
            className="summary-input"
          />
        ]
        : [
          summaryForm.email ? <a key="email" href={`mailto:${summaryForm.email}`}>{summaryForm.email}</a> : 'No email',
          summaryForm.phone ? <a key="phone" href={`tel:${summaryForm.phone}`}>{summaryForm.phone}</a> : 'No phone',
        ],
    },
    {
      icon: BuildingIcon,
      label: 'Organization',
      value: summaryForm.company || 'Add organization',
      input: (
        <input
          type="text"
          value={summaryForm.company}
          onChange={(e) => handleSummaryFieldChange('company', e.target.value)}
          placeholder="Organization"
          className="summary-input"
        />
      ),
    },
    {
      icon: CalendarIcon,
      label: 'Expected close date',
      value: formatShortDate(
        summaryForm.expected_close_date ||
        lead.expected_close_date ||
        lead.updated_at ||
        lead.created_at
      ),
      input: (
        <input
          type="date"
          value={toDateInputValue(summaryForm.expected_close_date || lead.expected_close_date)}
          onChange={(e) => handleSummaryFieldChange('expected_close_date', e.target.value)}
          className="summary-input"
        />
      ),
    },
  ];

  return (
    <div className="lead-detail-container">
      {notification && (
        <div className={`status-notification ${notification.type}`}>
          <div className="notification-content">
            {notification.type === 'won' && (
              <>
                <div className="notification-emoji">🎉</div>
                <div className="notification-title">WON</div>
                <div className="notification-emoji">🎉</div>
              </>
            )}
            {notification.type === 'lost' && (
              <>
                <div className="notification-title lost-title">LOST</div>
              </>
            )}
            {notification.type === 'error' && (
              <>
                <div className="notification-title error-title">Error</div>
              </>
            )}
            <div className="notification-message">{notification.message}</div>
            <button className="notification-done-btn" onClick={closeNotification}>
              Done
            </button>
          </div>
        </div>
      )}

      <div className="deal-page">
        <header className="deal-header">
          <div className="deal-header-left">
            <div className="deal-title-group">
              <h1>{lead.title || lead.name || lead.company || 'Untitled Deal'}</h1>
              <div className="deal-meta">
                <span className="deal-value">{formatValue(lead.value, lead.currency || 'USD')}</span>
                {lead.location && (
                  <span className="deal-location">
                    <LocationIcon />
                    {lead.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="deal-header-right">
            <div className="owner-select">
              <button
                type="button"
                className="owner-trigger"
                onClick={() => setShowOwnerDropdown(!showOwnerDropdown)}
              >
                <span className="owner-name">{getOwnerName()}</span>
                <span className="owner-chevron">▾</span>
              </button>
              {showOwnerDropdown && (
                <div className="owner-dropdown-menu">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className={`owner-option ${lead?.owner_id === user.id ? 'active' : ''}`}
                      onClick={() => handleOwnerSelect(user.id)}
                    >
                      {user.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`owner-option ${!lead?.owner_id ? 'active' : ''}`}
                    onClick={() => handleOwnerSelect(null)}
                  >
                    Unassigned
                  </button>
                </div>
              )}
            </div>
            <div className="deal-header-actions">
              <button
                className="header-action won"
                onClick={handleWon}
                disabled={updating || (lead?.stage_name || lead?.status || '').toLowerCase() === 'closed'}
              >
                Won
              </button>
              {isLostStatus() ? (
                <button
                  className="header-action reopen"
                  onClick={handleReopen}
                  disabled={updating}
                >
                  Reopen
                </button>
              ) : (
                <button
                  className="header-action lost"
                  onClick={handleLostClick}
                  disabled={updating}
                >
                  Lost
                </button>
              )}
              <button
                className="header-action delete"
                onClick={handleDelete}
                disabled={updating}
              >
                Delete
              </button>
            </div>
          </div>
        </header>

        <section className="deal-stage-bar">
          {stagesToRender.map((stage, index) => (
            <div
              key={stage.id}
              className={`stage-chip ${index === currentStageIndex ? 'active' : ''} ${updating ? 'disabled' : 'clickable'}`}
              onClick={() => handleStageClick(stage)}
            >
              <span className="stage-color" style={{ backgroundColor: stage.color }} />
              <span>{stage.label || stage.name}</span>
            </div>
          ))}
        </section>

        <section className="deal-body">
          <aside className="deal-sidebar">
            <div className="sidebar-card summary-card">
              <div className="sidebar-card-header">
                <h3>Summary</h3>
                <div className="summary-actions">
                  {isSummaryEditing ? (
                    <>
                      <button type="button" className="outline-button" onClick={handleSummaryCancel} disabled={updating}>
                        Cancel
                      </button>
                      <button type="button" className="header-action won" onClick={handleSummarySave} disabled={updating}>
                        Save
                      </button>
                    </>
                  ) : (
                    <button type="button" className="outline-button" onClick={() => setIsSummaryEditing(true)}>
                      Edit
                    </button>
                  )}
                </div>
              </div>
              <ul className="summary-list">
                {summaryCards.map(({ icon: IconComponent, label, value, subitems, input }) => (
                  <li key={label} className="summary-item">
                    <span className="summary-icon">
                      <IconComponent />
                    </span>
                    <div className="summary-info">
                      <span className="summary-label">{label}</span>
                      {Array.isArray(subitems) ? (
                        <div className="summary-subitems">
                          <span className="summary-value">{value}</span>
                          {subitems.map((item, idx) => (
                            <span key={idx} className="summary-subtext">{item}</span>
                          ))}
                        </div>
                      ) : (
                        isSummaryEditing && input ? input : <span className="summary-value">{value}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sidebar-card details-card">
              <div className="sidebar-card-header">
                <h3>Details</h3>
              </div>
              <p className="details-empty-text">
                Your details section is empty. Add custom fields or drag and drop existing ones to populate it.
              </p>
              <button type="button" className="outline-button">
                Drag and drop fields
              </button>
            </div>

            <div className="sidebar-card tags-card">
              <div className="sidebar-card-header">
                <h3>Tags</h3>
              </div>
              <div className="tags-container">
                <span className="tag tag-hot">Hot</span>
                <button type="button" className="tag-add">
                  <PlusIcon />
                </button>
              </div>
            </div>

            <div className="sidebar-card source-card">
              <div className="sidebar-card-header">
                <h3>Source</h3>
              </div>
              <div className="source-list">
                <div className="source-row">
                  <span className="source-label">Source origin</span>
                  <span className="source-value">Manually created</span>
                </div>
                <div className="source-row">
                  <span className="source-label">Campaign</span>
                  <span className="source-value">Campaigns</span>
                </div>
              </div>
            </div>
          </aside>

          <main className="deal-main">
            <div className="detail-tabs">
              {TAB_CONFIG.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  className={`tab-btn ${activeTab === id ? 'active' : ''}`}
                  onClick={() => { setActiveTab(id); setMountedTabs(prev => new Set(prev).add(id)); }}
                >
                  <Icon />
                  <span>{label}</span>
                  {id !== 'Timeline' && <span className="tab-count">{tabCounts[id] || 0}</span>}
                </button>
              ))}
            </div>
            <div className="tab-pane-multi">
              {Object.entries(tabContent).map(([tabId, content]) => (
                <div
                  key={tabId}
                  style={{ display: activeTab === tabId ? 'block' : 'none', height: '100%' }}
                  className={`tab-content-item${activeTab === tabId ? ' active' : ''}`}
                >
                  {mountedTabs.has(tabId) ? content : null}
                </div>
              ))}
            </div>
          </main>
        </section>
      </div>

      {showLostModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Mark as Lost</h3>
            <p>Add a note for why this lead is lost (optional).</p>
            <textarea
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              placeholder="Reason for loss..."
              rows={4}
            />
            <div className="modal-actions">
              <button
                className="outline-button"
                onClick={handleLostCancel}
                disabled={lostSubmitting}
              >
                Cancel
              </button>
              <button
                className="header-action lost"
                onClick={handleLostSubmit}
                disabled={lostSubmitting}
              >
                {lostSubmitting ? 'Saving...' : 'Submit & Mark Lost'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeadDetail;
