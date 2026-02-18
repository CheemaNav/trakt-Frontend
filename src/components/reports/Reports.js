import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reports.css';
import useFetchWithPolling from '../../hooks/useFetchWithPolling';
import { getAuthHeader } from '../../utils/auth';
import { TableSkeleton, SummaryCardsSkeleton } from '../common/SkeletonLoader';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const FilterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const RefreshIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 8.7 6.5"></path>
    <path d="M21 3v6h-6"></path>
    <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-8.7-6.5"></path>
    <path d="M3 21v-6h6"></path>
  </svg>
);

// Map status to stage
const getStageFromStatus = (status) => {
  const stageMap = {
    'Not Contacted': 'Contact Made',
    'Contacted': 'Qualified',
    'Closed': 'Negotiations Started',
    'Lost': 'Contact Made'
  };
  return stageMap[status] || 'Contact Made';
};

// Map status to display status (Open/Won/Lost)
const getDisplayStatus = (status) => {
  if (status === 'Closed') return 'Won';
  if (status === 'Lost') return 'Lost';
  return 'Open';
};

// Status colors
const statusColors = {
  'Open': '#3b82f6',
  'Won': '#10b981',
  'Lost': '#ef4444'
};

function Reports() {
  const navigate = useNavigate();

  // Use custom hook for polling data
  const { data: leadsData, loading: leadsLoading, refresh: refreshLeads } = useFetchWithPolling(`${API_URL}/leads`);
  const { data: usersData, loading: usersLoading, refresh: refreshUsers } = useFetchWithPolling(`${API_URL}/users`);

  // Derived state
  const leads = leadsData?.leads || [];
  const users = usersData?.users || [];
  const loading = leadsLoading || usersLoading;

  const [activities, setActivities] = useState({}); // Map of leadId -> latest activity
  const [filters, setFilters] = useState({
    owner: '',
    timePeriod: 'Yearly',
    pipeline: 'All Pipelines',
    stage: 'All Stages',
    status: 'All Statuses'
  });
  const [showStageDropdown, setShowStageDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPipelineDropdown, setShowPipelineDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchActivitiesForLeads = async () => {
      if (leads.length === 0) return;

      try {
        const token = localStorage.getItem('token');
        const activitiesMap = {};

        // Fetch activities for each lead
        await Promise.all(
          leads.map(async (lead) => {
            try {
              const response = await fetch(`${API_URL}/leads/${lead.id}/activities`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (response.ok) {
                const data = await response.json();
                if (data.activities && data.activities.length > 0) {
                  // Get the most recent activity
                  const latestActivity = data.activities[0];
                  activitiesMap[lead.id] = latestActivity;
                }
              }
            } catch (error) {
              console.error(`Error fetching activities for lead ${lead.id}:`, error);
            }
          })
        );

        setActivities(activitiesMap);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivitiesForLeads();
  }, [leads]);


  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowStageDropdown(false);
      setShowStatusDropdown(false);
      setShowPipelineDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getOwnerName = (ownerId) => {
    const owner = users.find(u => u.id === ownerId);
    return owner ? owner.name : 'Unassigned';
  };

  const formatActivity = (activity) => {
    if (!activity) return 'No recent activity';

    const action = activity.action || '';
    const details = activity.details || '';
    const createdAt = activity.created_at || activity.timestamp;

    let activityText = action;
    if (details) {
      activityText += ` ${details}`;
    }

    if (createdAt) {
      const date = new Date(createdAt);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      activityText += `. ${formattedDate}, ${formattedTime}`;
    }

    return activityText;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getExpectedCloseDate = (createdAt) => {
    if (!createdAt) return 'N/A';
    const date = new Date(createdAt);
    // Add 7 days as default expected close date
    date.setDate(date.getDate() + 7);
    return formatDate(date.toISOString());
  };

  // Filter leads based on filters
  const filteredLeads = leads.filter(lead => {
    if (filters.owner && lead.owner_id && lead.owner_id.toString() !== filters.owner) {
      return false;
    }
    if (filters.pipeline !== 'All Pipelines') {
      // For now, all leads are in "New Pipeline" or "Pipeline"
      // You can add pipeline field to database later
      if (filters.pipeline === 'New Pipeline' && lead.created_at) {
        // Assume newer leads are in "New Pipeline"
        const leadDate = new Date(lead.created_at);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        if (leadDate < sixMonthsAgo) return false;
      }
    }
    if (filters.stage !== 'All Stages' && getStageFromStatus(lead.status) !== filters.stage) {
      return false;
    }
    if (filters.status !== 'All Statuses') {
      const displayStatus = getDisplayStatus(lead.status);
      if (displayStatus !== filters.status) {
        return false;
      }
    }
    return true;
  });

  // Calculate summary statistics
  const totalDeals = filteredLeads.length;
  const wonDeals = filteredLeads.filter(lead => lead.status === 'Closed').length;
  const lostDeals = filteredLeads.filter(lead => lead.status === 'Lost').length;
  const openDeals = filteredLeads.filter(lead => lead.status !== 'Closed' && lead.status !== 'Lost').length;

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageLeads = filteredLeads.slice(startIndex, endIndex);

  const handleRefresh = async () => {
    await Promise.all([refreshLeads(), refreshUsers()]);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Get unique stages from leads
  const stages = ['All Stages', 'Contact Made', 'Qualified', 'Demo Scheduled', 'Negotiations Started'];
  const statuses = ['All Statuses', 'Open', 'Won', 'Lost'];

  return (
    <div className="reports-container">
      {/* Header with Filters */}
      <div className="reports-header">
        <div className="reports-filters">
          <select
            className="filter-dropdown"
            value={filters.owner}
            onChange={(e) => handleFilterChange('owner', e.target.value)}
          >
            <option value="">All Owners</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>

          <select
            className="filter-dropdown"
            value={filters.timePeriod}
            onChange={(e) => handleFilterChange('timePeriod', e.target.value)}
          >
            <option value="Yearly">Yearly</option>
            <option value="Monthly">Monthly</option>
            <option value="Weekly">Weekly</option>
            <option value="Daily">Daily</option>
          </select>

          <div className="filter-dropdown-wrapper">
            <button
              className="filter-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPipelineDropdown(!showPipelineDropdown);
                setShowStageDropdown(false);
                setShowStatusDropdown(false);
              }}
            >
              {filters.pipeline}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {showPipelineDropdown && (
              <div className="filter-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => handleFilterChange('pipeline', 'All Pipelines')}>All Pipelines</button>
                <button onClick={() => handleFilterChange('pipeline', 'New Pipeline')}>New Pipeline</button>
                <button onClick={() => handleFilterChange('pipeline', 'Pipeline')}>Pipeline</button>
              </div>
            )}
          </div>

          <div className="filter-dropdown-wrapper">
            <button
              className="filter-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowStageDropdown(!showStageDropdown);
                setShowPipelineDropdown(false);
                setShowStatusDropdown(false);
              }}
            >
              {filters.stage}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {showStageDropdown && (
              <div className="filter-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                {stages.map(stage => (
                  <button
                    key={stage}
                    onClick={() => {
                      handleFilterChange('stage', stage);
                      setShowStageDropdown(false);
                    }}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="filter-dropdown-wrapper">
            <button
              className="filter-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowStatusDropdown(!showStatusDropdown);
                setShowPipelineDropdown(false);
                setShowStageDropdown(false);
              }}
            >
              {filters.status}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {showStatusDropdown && (
              <div className="filter-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                {statuses.map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      handleFilterChange('status', status);
                      setShowStatusDropdown(false);
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="filter-icon-btn" title="Filter">
            <FilterIcon />
          </button>

          <button className="refresh-btn" onClick={handleRefresh} title="Refresh">
            <RefreshIcon />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="reports-summary">
        <div className="summary-card">
          <div className="summary-label">TOTAL DEALS</div>
          <div className="summary-value">{totalDeals}</div>
        </div>
        <div className="summary-card won">
          <div className="summary-label">WON DEALS</div>
          <div className="summary-value">{wonDeals}</div>
        </div>
        <div className="summary-card lost">
          <div className="summary-label">LOST DEALS</div>
          <div className="summary-value">{lostDeals}</div>
        </div>
        <div className="summary-card open">
          <div className="summary-label">OPEN DEALS</div>
          <div className="summary-value">{openDeals}</div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="reports-table-controls">
        <div className="table-entries">
          <span>Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="entries-select"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span>entries</span>
        </div>
      </div>

      {/* Deals Table */}
      <div className="reports-table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Deal</th>
              <th>Stage</th>
              <th>Status</th>
              <th>Pipeline</th>
              <th>Last Activity</th>
              <th>Owner</th>
              <th>Created At</th>
              <th>Expected Close date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ padding: 0, border: 'none' }}>
                  <TableSkeleton rows={6} columns={8} showCheckbox={false} showAvatar={false} />
                </td>
              </tr>
            ) : currentPageLeads.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-cell">No deals found</td>
              </tr>
            ) : (
              currentPageLeads.map(lead => {
                const displayStatus = getDisplayStatus(lead.status);
                const stage = getStageFromStatus(lead.status);
                const activity = activities[lead.id];

                return (
                  <tr
                    key={lead.id}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="deal-name-cell">
                      <div className="deal-name">{lead.name || lead.title || 'Untitled Deal'}</div>
                    </td>
                    <td>
                      <span className="stage-pill">{stage}</span>
                    </td>
                    <td>
                      <span
                        className="status-pill"
                        style={{ backgroundColor: statusColors[displayStatus] || '#6b7280' }}
                      >
                        {displayStatus}
                      </span>
                    </td>
                    <td>{filters.pipeline === 'All Pipelines' ? 'New Pipeline' : filters.pipeline}</td>
                    <td className="activity-cell">
                      <div className="activity-text">{formatActivity(activity)}</div>
                    </td>
                    <td>
                      {lead.owner_id ? (
                        <div className="owner-cell">
                          {getOwnerName(lead.owner_id)}
                        </div>
                      ) : (
                        'Unassigned'
                      )}
                    </td>
                    <td>{formatDate(lead.created_at)}</td>
                    <td>{getExpectedCloseDate(lead.created_at)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="reports-pagination">
        <div className="pagination-info">
          Showing {filteredLeads.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredLeads.length)} of {filteredLeads.length} entries
        </div>
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            Previous
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
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Reports;

