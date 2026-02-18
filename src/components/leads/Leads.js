import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import AddLeadModal from './AddLeadModal';
import LeadCard from './LeadCard';
import { KanbanSkeleton, TableSkeleton } from '../common/SkeletonLoader';
import './Leads.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const PipelinesIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="3" y="4" width="4" height="16" rx="1" />
    <rect x="10" y="8" width="4" height="12" rx="1" />
    <rect x="17" y="12" width="4" height="8" rx="1" />
  </svg>
);

const ListIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M8 6h13" />
    <path d="M8 12h13" />
    <path d="M8 18h13" />
    <circle cx="4" cy="6" r="1.5" />
    <circle cx="4" cy="12" r="1.5" />
    <circle cx="4" cy="18" r="1.5" />
  </svg>
);

const ArchiveIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <path d="M5 8h14v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z" />
    <path d="M10 12h4" />
  </svg>
);

const RefreshIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 8.7 6.5" />
    <path d="M21 3v6h-6" />
    <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-8.7-6.5" />
    <path d="M3 21v-6h6" />
  </svg>
);



// Default stages fallback
const DEFAULT_STAGES = [
  { id: 'Contacted', label: 'Contacted', color: '#fbbc04' },
  { id: 'Not Contacted', label: 'Not Contacted', color: '#1a73e8' },
  { id: 'Closed', label: 'Closed', color: '#34a853' },
  { id: 'Lost', label: 'Lost', color: '#ea4335' }
];

// Draggable Lead Card Component
function DraggableLeadCard({ lead, onDelete, onStatusChange }) {
  const nav = useNavigate();
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'lead',
    item: {
      id: lead.id,
      currentStatus: lead.status,
      currentStageId: lead.stage_id || lead.pipeline_stage_id, // Add current stage ID
      leadData: lead // Store full lead data for the drop handler
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      // This runs after drop completes or is cancelled
      if (!monitor.didDrop()) {
        // Drag was cancelled
        console.log('Drag cancelled');
      }
    },
  }), [lead.id, lead.status, lead.stage_id, lead.pipeline_stage_id, lead]);

  return (
    <div
      ref={drag}
      onMouseDown={(e) => {
        // Store click position
        const clickX = e.clientX;
        const clickY = e.clientY;

        const handleMouseUp = (upEvent) => {
          // Check if it was a click (little movement)
          const moveX = Math.abs(upEvent.clientX - clickX);
          const moveY = Math.abs(upEvent.clientY - clickY);

          if (moveX < 5 && moveY < 5 && !isDragging) {
            // It was a click, navigate
            nav(`/leads/${lead.id}`);
          }

          document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mouseup', handleMouseUp);
      }}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab'
      }}
      className="draggable-lead-wrapper"
    >
      <LeadCard lead={lead} onDelete={onDelete} onStatusChange={onStatusChange} />
    </div>
  );
}

// Droppable Column Component
function DroppableColumn({ status, children, onDrop }) {
  const stageId = status.stageId || status.id;
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'lead',
    drop: (item, monitor) => {
      if (item.currentStageId !== stageId) {
        // Pass both the ID and the full lead data
        onDrop(item.id, stageId, item.leadData);
      }
    },
    canDrop: (item) => item.currentStageId !== stageId,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [stageId, onDrop]);

  const isActive = isOver && canDrop;

  return (
    <div ref={drop} className={`kanban-column ${isActive ? 'drag-over' : ''}`}>
      {children}
      {isActive && (
        <div className="drop-message">
          Drop here to move to {status.label || status.name}
        </div>
      )}
    </div>
  );
}

function Leads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('Pipeline');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [filters, setFilters] = useState({
    pipeline: '',
    contact: '',
    status: '',
    owner: ''
  });
  const [contactOptions, setContactOptions] = useState([]);
  const [ownerOptions, setOwnerOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([
    'Not Contacted',
    'Contacted',
    'Closed',
    'Lost'
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [stagesLoaded, setStagesLoaded] = useState(false);
  const [pipelinesLoaded, setPipelinesLoaded] = useState(false);
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState(() => {
    // Load selected pipeline from localStorage on mount
    const savedPipelineId = localStorage.getItem('selectedPipelineId');
    return savedPipelineId ? { id: parseInt(savedPipelineId) } : null;
  });
  const [stages, setStages] = useState([]);
  const [showPipelineDropdown, setShowPipelineDropdown] = useState(false);

  useEffect(() => {
    fetchPipelines();
    // Don't fetch leads immediately - wait for pipeline to be restored
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    // Fetch leads when pipeline selection changes (after pipeline is properly set)
    // Only fetch if we have a full pipeline object (not just an ID)
    if (selectedPipeline && selectedPipeline.id && selectedPipeline.name) {
      fetchLeads();
    } else if (!selectedPipeline && pipelinesLoaded && pipelines.length === 0) {
      // No pipelines exist, fetch all leads (for backward compatibility)
      fetchLeads();
    }
  }, [selectedPipeline]);

  useEffect(() => {
    if (!pipelinesLoaded) {
      // Pipelines haven't been fetched yet, wait for them
      return;
    }

    if (pipelines.length === 0) {
      // No pipelines exist, use default stages (backward compatibility)
      setStages(DEFAULT_STAGES);
      setStagesLoaded(true);
      setStatusOptions(DEFAULT_STAGES.map(s => s.label || s.name));
      fetchLeads();
      return;
    }

    // Check if we have a saved pipeline ID in localStorage
    const savedPipelineId = localStorage.getItem('selectedPipelineId');

    if (savedPipelineId) {
      // Try to find the saved pipeline
      const savedPipeline = pipelines.find(p => p.id === parseInt(savedPipelineId));
      if (savedPipeline) {
        // Restore the saved pipeline (only if not already set or if it's different)
        if (!selectedPipeline || !selectedPipeline.name || selectedPipeline.id !== savedPipeline.id) {
          setSelectedPipeline(savedPipeline);
          fetchPipelineStages(savedPipeline.id);
          // fetchLeads will be called by the selectedPipeline useEffect
        }
        return;
      }
    }

    // No saved pipeline or saved pipeline not found
    // Check if we already have a selected pipeline with full data
    if (selectedPipeline && selectedPipeline.id && selectedPipeline.name) {
      // Verify the selected pipeline still exists
      const existingPipeline = pipelines.find(p => p.id === selectedPipeline.id);
      if (existingPipeline) {
        // Pipeline still exists, update with full data if needed
        if (selectedPipeline.name !== existingPipeline.name) {
          setSelectedPipeline(existingPipeline);
          fetchPipelineStages(existingPipeline.id);
        }
        return;
      }
    }

    // No valid pipeline selected, use default
    const defaultPipeline = pipelines.find(p => p.is_default === 1) || pipelines[0];
    if (defaultPipeline) {
      setSelectedPipeline(defaultPipeline);
      fetchPipelineStages(defaultPipeline.id);
      localStorage.setItem('selectedPipelineId', defaultPipeline.id.toString());
      // fetchLeads will be called by the selectedPipeline useEffect
    }
  }, [pipelines, pipelinesLoaded]);

  // Refresh status options whenever stages change
  useEffect(() => {
    if (stages && stages.length > 0) {
      setStatusOptions(stages.map(s => s.label || s.name));
    }
  }, [stages]);

  const fetchPipelines = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch(`${API_URL}/pipelines`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPipelines(data.pipelines || []);
      } else {
        console.error('Failed to fetch pipelines:', response.status, response.statusText);
        if (response.status === 404) {
          console.warn('Pipelines endpoint not found. Please restart the backend server.');
        }
      }
    } catch (error) {
      console.error('Error fetching pipelines:', error);
    } finally {
      setPipelinesLoaded(true);
    }
  };

  const fetchPipelineStages = async (pipelineId) => {
    console.log('[Leads] Fetching stages for pipeline:', pipelineId);
    try {
      const token = localStorage.getItem('token');
      if (!token || !pipelineId) {
        console.error('Missing token or pipelineId');
        setStages(DEFAULT_STAGES);
        return;
      }

      const response = await fetch(`${API_URL}/pipelines/${pipelineId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Leads] Stages response:', data);
        if (data.pipeline && data.pipeline.stages) {
          const formattedStages = data.pipeline.stages.map(stage => ({
            id: stage.id, // Use stage ID instead of name
            stageId: stage.id,
            label: stage.name,
            name: stage.name,
            color: stage.color || '#1a73e8',
            probability: stage.probability || 0
          }));
          console.log('[Leads] Setting formatted stages:', formattedStages);
          setStages(formattedStages);
          setStagesLoaded(true);
        } else {
          console.warn('[Leads] No stages found in response.');
          setStages([]);
          setStagesLoaded(true);
        }
      } else {
        console.error('Failed to fetch pipeline stages:', response.status);
        // On error, better to keep previous stages or show error than defaults?
        // But defaults might be better than nothing if it's a network glitch? 
        // For now, let's stick to defaults ONLY on error, but maybe that's the cause of the flash if error happens?
        // Let's try NOT setting defaults on error if we already have stages?
        // setStages(DEFAULT_STAGES); 
      }
    } catch (error) {
      console.error('Error fetching pipeline stages:', error);
      // setStages(DEFAULT_STAGES);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Don't close if clicking inside the pipeline dropdown
      if (e.target.closest('.pipeline-dropdown-wrapper')) {
        return;
      }
      setOpenMenuId(null);
      setShowPipelineDropdown(false);
    };
    if (openMenuId || showPipelineDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId, showPipelineDropdown]);

  const fetchFilterOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = { 'Authorization': `Bearer ${token}` };

      // Contacts
      const contactsResp = await fetch(`${API_URL}/contacts`, { headers });
      if (contactsResp.ok) {
        const contactsData = await contactsResp.json();
        const contactsList = contactsData.contacts || [];
        const names = new Set();
        contactsList.forEach((c) => {
          const nameFromParts = [c.first_name, c.last_name].filter(Boolean).join(' ').trim();
          const fallback = c.name || c.email || '';
          const finalName = nameFromParts || fallback;
          if (finalName) names.add(finalName);
        });
        setContactOptions(Array.from(names));
      }

      // Owners (users)
      const usersResp = await fetch(`${API_URL}/users`, { headers });
      if (usersResp.ok) {
        const usersData = await usersResp.json();
        const usersList = usersData.users || [];
        setOwnerOptions(usersList.map((u) => ({ id: u.id, name: u.name || u.email || `User ${u.id}` })));
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchLeads = async () => {
    try {
      setIsRefreshing(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLeads([]);
        return;
      }

      // Only fetch leads if we have a valid pipeline (with name property) or no pipelines exist
      // This prevents fetching with incomplete pipeline data
      const pipelineId = selectedPipeline?.id && selectedPipeline?.name
        ? selectedPipeline.id
        : null;

      const url = pipelineId
        ? `${API_URL}/leads?pipeline_id=${pipelineId}`
        : `${API_URL}/leads`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const fetchedLeads = data.leads || [];
        console.log(`[Leads] Fetched ${fetchedLeads.length} leads for pipeline:`, selectedPipeline?.name || 'All');
        console.log('[Leads] Sample lead:', fetchedLeads[0]);
        setLeads(fetchedLeads);

        // Derive filter options from the fetched leads (pipeline-aware)
        const contactSet = new Set();
        const ownerMap = new Map();
        fetchedLeads.forEach((lead) => {
          if (lead.name) contactSet.add(lead.name);
          if (lead.email) contactSet.add(lead.email);
          if (lead.company) contactSet.add(lead.company);

          if (lead.owner_id) {
            const ownerLabel = lead.owner_name || lead.owner_email || `User ${lead.owner_id}`;
            ownerMap.set(lead.owner_id, ownerLabel);
          }
        });
        setContactOptions(Array.from(contactSet));
        setOwnerOptions(Array.from(ownerMap.entries()).map(([id, name]) => ({ id, name })));
      } else {
        console.error('Failed to fetch leads:', response.status, response.statusText);
        setLeads([]);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setIsRefreshing(false);
      setInitialLoading(false);
    }
  };

  const handleAddLead = async (leadData) => {
    try {
      console.log('[Leads] handleAddLead called with leadData:', leadData);
      console.log('[Leads] lead_type in request:', leadData.lead_type);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(leadData)
      });

      if (response.ok) {
        const data = await response.json();
        const newLead = data.lead || data.deal;
        if (newLead) {
          // Ensure lead_type is included from response or request
          const leadWithType = {
            ...newLead,
            lead_type: newLead.lead_type || leadData.lead_type || null
          };
          console.log('New lead created:', leadWithType);
          setLeads(prevLeads => {
            const filtered = prevLeads.filter(existingLead => String(existingLead.id) !== String(leadWithType.id));
            return [leadWithType, ...filtered];
          });
        } else {
          // If response doesn't have lead, fetch all leads to get the latest data
          await fetchLeads();
        }
        setShowAddModal(false);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add lead');
      }
    } catch (error) {
      console.error('Error adding lead:', error);
      throw error;
    }
  };

  const handleEditLead = async (leadData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads/${selectedLead.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(leadData)
      });

      if (response.ok) {
        const data = await response.json();
        const updatedLead = data.lead || data.deal;

        if (updatedLead) {
          // Ensure lead_type is included
          const leadWithType = {
            ...updatedLead,
            lead_type: updatedLead.lead_type || leadData.lead_type || null
          };
          setLeads(prevLeads =>
            prevLeads.map(lead =>
              String(lead.id) === String(leadWithType.id) ? leadWithType : lead
            )
          );
        } else {
          await fetchLeads();
        }

        setShowEditModal(false);
        setSelectedLead(null);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update lead');
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  };

  const openEditModal = (lead) => {
    setSelectedLead(lead);
    setShowEditModal(true);
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Lead deleted successfully:', data);
        await fetchLeads();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete lead' }));
        console.error('Delete lead error response:', errorData);
        alert(errorData.error || 'Failed to delete lead');
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Error deleting lead. Please try again.');
    }
  };

  const handleDrop = async (leadId, newStageId, leadData = null) => {
    try {
      const token = localStorage.getItem('token');

      // Try to find lead in the array first, then use leadData from drag item if not found
      let lead = leads.find(l => String(l.id) === String(leadId) || l.id === leadId);

      // If not found in array, use the leadData passed from drag item
      if (!lead && leadData) {
        lead = leadData;
      }

      // If still not found, fetch from API
      if (!lead) {
        console.error('Lead not found in state, fetching from API...', { leadId, leads });
        try {
          const fetchResponse = await fetch(`${API_URL}/leads/${leadId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (fetchResponse.ok) {
            const data = await fetchResponse.json();
            lead = data.lead;
          } else {
            console.error('Could not fetch lead:', await fetchResponse.json());
            return;
          }
        } catch (fetchError) {
          console.error('Error fetching lead:', fetchError);
          return;
        }
      }

      // Find the stage name for the new stage
      const newStage = stages.find(s => s.stageId === newStageId || s.id === newStageId);
      const newStageName = newStage ? newStage.name || newStage.label : '';

      // Optimistically update the UI
      setLeads(prevLeads =>
        prevLeads.map(l =>
          String(l.id) === String(leadId) || l.id === leadId
            ? { ...l, stage_id: newStageId, stage_name: newStageName }
            : l
        )
      );

      // Send stage_id update
      const response = await fetch(`${API_URL}/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          stage_id: newStageId,
          pipeline_id: selectedPipeline?.id
        })
      });

      if (response.ok) {
        // Refresh to get the latest data from server
        await fetchLeads();
      } else {
        // Revert on error
        const errorData = await response.json();
        console.error('Failed to update:', errorData);
        await fetchLeads(); // Refresh to revert to correct state
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      // Revert on error
      await fetchLeads(); // Refresh to revert to correct state
    }
  };

  const filteredLeads = leads.filter(lead => {
    // First filter by pipeline - if pipeline is selected, only show leads from that pipeline
    if (selectedPipeline) {
      const leadPipelineId = lead.pipeline_id || lead.pipeline?.id;
      // If lead has pipeline_id (or nested pipeline object), it must match selected pipeline
      if (leadPipelineId && String(leadPipelineId) !== String(selectedPipeline.id)) {
        return false;
      }
      // If lead has no pipeline info but pipeline is selected, don't show it (strict filtering)
      if (!leadPipelineId) {
        // Log this case as it might be why leads disappear
        // console.log('Filtering out lead without pipeline_id:', lead.id);
        return false;
      }
    } else {
      // No pipeline selected - only show leads without pipeline_id (backward compatibility)
      // Or show all leads if you want, but typically we want to show only unassigned leads
      const leadPipelineId = lead.pipeline_id || lead.pipeline?.id;
      if (leadPipelineId) {
        return false; // Don't show leads assigned to pipelines when no pipeline is selected
      }
    }

    // Then apply search filter
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase());

    // Then apply status filter
    const matchesStatus = !filters.status || lead.status === filters.status || lead.stage_name === filters.status;

    // Contact filter matches lead.name/contact person
    const matchesContact = !filters.contact
      || (lead.name && lead.name === filters.contact)
      || (lead.email && lead.email === filters.contact)
      || (lead.company && lead.company === filters.contact);

    // Owner filter matches owner_id
    const matchesOwner = !filters.owner || String(lead.owner_id) === String(filters.owner);

    return matchesSearch && matchesStatus && matchesContact && matchesOwner;
  });

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const getLeadsByStage = (stage, allStages) => {
    const stageId = stage.stageId || stage.id;
    const stageName = (stage.name || stage.label || stage.id).toLowerCase();
    // Fix: only compare stageId if it actually exists (not undefined)
    const firstStage = allStages && allStages.length > 0 ? allStages[0] : null;
    const isFirstStage = firstStage && (
      String(firstStage.id) === String(stage.id) ||
      (firstStage.stageId != null && stage.stageId != null && String(firstStage.stageId) === String(stage.stageId))
    );

    // filteredLeads already filters by pipeline, so we just need to match by stage
    const matchedLeads = filteredLeads.filter((lead) => {
      // Match by stage_id if available (preferred method)
      const leadStageId = lead.stage_id || lead.pipeline_stage_id;

      if (leadStageId) {
        const isMatch = String(leadStageId) === String(stageId);
        if (isMatch) return true;

        // NEW: Handle Orphans
        // If this lead has a stage_id that DOES NOT match any stage in the current pipeline,
        // and we are currently rendering the FIRST stage, catch it here.
        if (isFirstStage && allStages) {
          const isOrphan = !allStages.some(s => String(s.id) === String(leadStageId) || String(s.stageId) === String(leadStageId));
          if (isOrphan) {
            return true;
          }
        }
        return false;
      }

      // Fallback: match by status/stage name (case insensitive) for backward compatibility
      // Only for leads without stage_id
      const leadStatus = (lead.status || lead.stage_name || '').toLowerCase();
      const isNameMatch = leadStatus === stageName;
      return isNameMatch;
    });
    return matchedLeads;
  };

  const getTotalValue = (statusLeads) => {
    return statusLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);
  };

  const formatValue = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="leads-container">
        {/* Header */}
        <div className="leads-header">
          <div className="leads-header-left">
            <div className="view-toggles">
              <button
                type="button"
                className={`view-toggle ${viewMode === 'Pipeline' ? 'active' : ''}`}
                onClick={() => setViewMode('Pipeline')}
              >
                <span className="view-toggle-icon">
                  <PipelinesIcon />
                </span>
                <span>Pipeline</span>
              </button>
              <button
                type="button"
                className={`view-toggle ${viewMode === 'List' ? 'active' : ''}`}
                onClick={() => setViewMode('List')}
              >
                <span className="view-toggle-icon">
                  <ListIcon />
                </span>
                <span>List</span>
              </button>
              {/* <button 
                type="button"
                className={`view-toggle ${viewMode === 'Archive' ? 'active' : ''}`}
                onClick={() => setViewMode('Archive')}
              >
                <span className="view-toggle-icon">
                  <ArchiveIcon />
                </span>
                <span>Archive</span>
              </button> */}
            </div>
            <button className="add-deal-btn-header" onClick={() => setShowAddModal(true)}>
              + Deal
            </button>

          </div>
          <div className="leads-header-right">
            <div className="action-buttons">
              <button
                type="button"
                className={`action-btn ${isRefreshing ? 'refreshing' : ''}`}
                onClick={() => fetchLeads()}
                aria-label="Refresh leads"
                disabled={isRefreshing}
              >
                <RefreshIcon />
              </button>
            </div>
            <div className="export-row">
              <div className="search-section-header">
                <input
                  type="text"
                  className="search-input-header"
                  placeholder="Search Deals"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="filter-row">

              <div className="pipeline-dropdown-wrapper" onClick={(e) => e.stopPropagation()}>
                <button
                  className="filter-dropdown pipeline-dropdown-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPipelineDropdown(!showPipelineDropdown);
                  }}
                  type="button"
                >
                  {selectedPipeline ? selectedPipeline.name : 'Select Pipeline'}
                  <span className="dropdown-arrow">▼</span>
                </button>
                {showPipelineDropdown && (
                  <div className="pipeline-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                    {pipelines.length > 0 ? (
                      pipelines.map((pipeline) => (
                        <div
                          key={pipeline.id}
                          className={`pipeline-dropdown-item ${selectedPipeline?.id === pipeline.id ? 'active' : ''}`}
                        >
                          <div
                            className="pipeline-dropdown-item-content"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPipeline(pipeline);
                              // Save selected pipeline to localStorage
                              localStorage.setItem('selectedPipelineId', pipeline.id.toString());
                              fetchPipelineStages(pipeline.id);
                              setShowPipelineDropdown(false);
                            }}
                          >
                            {pipeline.is_default === 1 && <span className="pipeline-star">★</span>}
                            <span className="pipeline-dropdown-item-name">{pipeline.name}</span>
                          </div>
                          <button
                            className="pipeline-edit-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/pipeline/edit/${pipeline.id}`);
                              setShowPipelineDropdown(false);
                            }}
                            title="Edit pipeline"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="pipeline-dropdown-item" style={{ color: '#999', cursor: 'default' }}>
                        No pipelines available
                      </div>
                    )}
                    <div className="pipeline-dropdown-divider"></div>
                    <div
                      className="pipeline-dropdown-item pipeline-add-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPipelineDropdown(false);
                        navigate('/pipeline/add');
                      }}
                    >
                      + Add New Pipeline
                    </div>
                  </div>
                )}
              </div>
              <select className="filter-dropdown" onChange={(e) => handleFilterChange('contact', e.target.value)} value={filters.contact}>
                <option value="">Select Contact</option>
                {contactOptions.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <select className="filter-dropdown" onChange={(e) => handleFilterChange('status', e.target.value)} value={filters.status}>
                <option value="">Select Status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <select className="filter-dropdown" onChange={(e) => handleFilterChange('owner', e.target.value)} value={filters.owner}>
                <option value="">Select Owner</option>
                {ownerOptions.map((owner) => (
                  <option key={owner.id} value={owner.id}>{owner.name}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Conditional Views */}
        {viewMode === 'Pipeline' && (
          /* Kanban Board */
          <div className='leads-kanban-board'>
            {(initialLoading || !stagesLoaded) ? (
              <KanbanSkeleton columns={4} cardsPerColumn={3} />
            ) : (
              <div className="kanban-board">
                {stages.map((stage) => {
                  const stageLeads = getLeadsByStage(stage, stages);
                  const totalValue = getTotalValue(stageLeads);

                  return (
                    <DroppableColumn
                      key={stage.stageId || stage.id}
                      status={stage}
                      onDrop={handleDrop}
                      onAddLead={() => setShowAddModal(true)}
                    >
                      <div className="column-header">
                        <div className="column-title">
                          <span
                            className="status-dot"
                            style={{ backgroundColor: stage.color }}
                            aria-hidden="true"
                          />
                          <span>{stage.label || stage.name}</span>
                        </div>
                        <div className="column-stats">
                          {stageLeads.length} Leads - {formatValue(totalValue)}
                        </div>
                        <div className="status-bar" style={{ backgroundColor: stage.color }}></div>
                      </div>

                      <div className="column-content">
                        {stageLeads.map((lead) => (
                          <DraggableLeadCard
                            key={lead.id}
                            lead={lead}
                            onDelete={() => handleDeleteLead(lead.id)}
                            onEdit={() => openEditModal(lead)}
                            onStatusChange={(newStageId) => handleDrop(lead.id, newStageId)}
                          />
                        ))}
                      </div>
                    </DroppableColumn>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {viewMode === 'List' && (
          /* List View */
          <div className="list-view">
            {initialLoading ? (
              <TableSkeleton rows={8} columns={10} showCheckbox={true} showAvatar={false} />
            ) : (
              <table className="deals-table">
                <thead>
                  <tr>
                    <th><input type="checkbox" /></th>
                    <th>Title</th>
                    <th>Organization</th>
                    <th>Contact Person</th>
                    <th>Expected Close Date</th>
                    <th>Pipeline</th>
                    <th>Pipeline Stage</th>
                    <th>Status</th>
                    <th>Last Activity</th>
                    <th>Owner</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => {
                    // Check if lead is expired
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

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => navigate(`/leads/${lead.id}`)}
                        style={{ cursor: 'pointer' }}
                        className={expired ? 'expired-lead-row' : ''}
                      >
                        <td><input type="checkbox" /></td>
                        <td className="title-cell">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="deal-title">{lead.company || lead.name} Deal</div>
                            {(lead.lead_type || lead.leadType) && (
                              <span style={{
                                fontSize: '0.75rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                backgroundColor: (lead.lead_type || lead.leadType) === 'hot' ? '#ea4335' : (lead.lead_type || lead.leadType) === 'warm' ? '#fbbc04' : '#1a73e8',
                                color: 'white',
                                fontWeight: '600'
                              }}>
                                {(lead.lead_type || lead.leadType) === 'hot' ? '🔥' : (lead.lead_type || lead.leadType) === 'warm' ? '🌤' : '❄️'} {(lead.lead_type || lead.leadType).charAt(0).toUpperCase() + (lead.lead_type || lead.leadType).slice(1)}
                              </span>
                            )}
                          </div>
                          <div className="deal-value">Value: ${lead.value || 0}</div>
                        </td>
                        <td>{lead.company || 'NA'}</td>
                        <td>{lead.name}</td>
                        <td>{lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</td>
                        <td>Default Pipeline</td>
                        <td>
                          <span className={`stage-pill ${lead.status.toLowerCase().replace(' ', '-')}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td><span className="status-pill open">Open</span></td>
                        <td className="activity-cell">
                          <div className="activity-text">No recent activity</div>
                          <div className="activity-date">Nov 3, 2025, 11:26 AM</div>
                        </td>
                        <td>
                          <select className="owner-select">
                            <option>Mike</option>
                          </select>
                        </td>
                        <td style={{ position: 'relative' }}>
                          <button
                            className="action-menu"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === lead.id ? null : lead.id);
                            }}
                          >
                            ⋮
                          </button>
                          {openMenuId === lead.id && (
                            <div className="list-action-menu" onClick={(e) => e.stopPropagation()}>
                              <button
                                className="action-menu-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  openEditModal(lead);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="action-menu-item action-menu-delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  handleDeleteLead(lead.id);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {viewMode === 'Archive' && (
          <div className="archive-view">
            <p>Archive view coming soon</p>
          </div>
        )}

        {/* Add Lead Modal */}
        {showAddModal && (
          <AddLeadModal
            onClose={() => setShowAddModal(false)}
            onSave={handleAddLead}
            selectedPipeline={selectedPipeline}
            selectedStageId={stages.length > 0 ? (stages[0].stageId || stages[0].id) : null}
          />
        )}

        {/* Edit Lead Modal */}
        {showEditModal && selectedLead && (
          <AddLeadModal
            key={selectedLead.id}
            onClose={() => {
              setShowEditModal(false);
              setSelectedLead(null);
            }}
            onSave={handleEditLead}
            initialData={selectedLead}
            isEditMode={true}
            selectedPipeline={selectedPipeline}
            selectedStageId={selectedLead.stage_id}
          />
        )}
      </div>
    </DndProvider >
  );
}

export default Leads;
