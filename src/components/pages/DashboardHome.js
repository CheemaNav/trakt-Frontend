import React, { useState, useEffect } from 'react';
import './DashboardHome.css';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function DashboardHome({ user }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leadsInStagesPeriod, setLeadsInStagesPeriod] = useState('Month');
  const [leadsTrendPeriod, setLeadsTrendPeriod] = useState('Month');
  const [revenuePeriod, setRevenuePeriod] = useState('Month');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/leads`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Leads fetched successfully:', data.leads?.length || 0, 'leads');
        setLeads(data.leads || []);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error fetching leads:', response.status, errorData);
        
        if (response.status === 401 || response.status === 403) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics dynamically from leads data
  const getTotalLeads = () => leads.length;
  
  const getThisMonthLeads = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return leads.filter(lead => new Date(lead.created_at) >= startOfMonth).length;
  };

  const getContactsCreated = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return leads.filter(lead => new Date(lead.created_at) >= startOfMonth).length;
  };

  const getPipelinesWon = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return leads.filter(lead => 
      lead.status === 'Closed' && new Date(lead.updated_at) >= startOfMonth
    ).length;
  };

  const getPipelinesLost = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return leads.filter(lead => 
      lead.status === 'Lost' && new Date(lead.updated_at) >= startOfMonth
    ).length;
  };

  // Calculate last month values for comparison
  const getLastMonthLeads = () => {
    const now = new Date();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    return leads.filter(lead => {
      const leadDate = new Date(lead.created_at);
      return leadDate >= startOfLastMonth && leadDate <= endOfLastMonth;
    }).length;
  };

  const calculatePercentageChange = (current, last) => {
    if (last === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - last) / last) * 100);
  };

  const totalLeads = getTotalLeads();
  const thisMonthLeads = getThisMonthLeads();
  const lastMonthLeads = getLastMonthLeads();
  const contactsCreated = getContactsCreated();
  const pipelinesWon = getPipelinesWon();
  const pipelinesLost = getPipelinesLost();

  // Overall (all time) win/loss counts across all pipelines
  const totalWonAllTime = leads.filter(lead => {
    const status = (lead.status || '').toLowerCase();
    return status === 'closed' || status === 'won';
  }).length;
  const totalLostAllTime = leads.filter(lead => {
    const status = (lead.status || '').toLowerCase();
    return status === 'lost';
  }).length;

  const thisMonthChange = calculatePercentageChange(thisMonthLeads, lastMonthLeads);
  const wonChange = calculatePercentageChange(pipelinesWon, 0);
  const lostChange = calculatePercentageChange(pipelinesLost, 0);

  // Get latest company
  const latestCompany = leads.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

  // Get leads by status for "Leads In Stages" chart
  const getLeadsByStatus = (period) => {
    const now = new Date();
    let startDate;
    
    if (period === 'Week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'Month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else { // Year
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const filteredLeads = leads.filter(lead => new Date(lead.created_at) >= startDate);
    
    const statusCounts = {
      'Not Contacted': 0,
      'Contacted': 0,
      'Closed': 0,
      'Lost': 0
    };

    filteredLeads.forEach(lead => {
      if (statusCounts.hasOwnProperty(lead.status)) {
        statusCounts[lead.status]++;
      }
    });

    return [
      { name: 'Not Contacted', value: statusCounts['Not Contacted'], color: '#3b82f6' },
      { name: 'Contacted', value: statusCounts['Contacted'], color: '#fbbf24' },
      { name: 'Closed', value: statusCounts['Closed'], color: '#10b981' },
      { name: 'Lost', value: statusCounts['Lost'], color: '#ef4444' }
    ];
  };

  // Get leads trend data for "Leads Trend" chart
  const getLeadsTrendData = (period) => {
    const now = new Date();
    let startDate;
    let useMonthly = false;
    
    if (period === 'Week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'Month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else { // Year
      startDate = new Date(now.getFullYear(), 0, 1);
      useMonthly = true;
    }

    const filteredLeads = leads.filter(lead => new Date(lead.created_at) >= startDate);
    
    const data = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= now) {
      let dateStr;
      let endDate;
      
      if (useMonthly) {
        dateStr = currentDate.toLocaleDateString('en-US', { month: 'short' });
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      } else {
        dateStr = currentDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        endDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      }
      
      const count = filteredLeads.filter(lead => {
        const leadDate = new Date(lead.created_at);
        return leadDate >= currentDate && leadDate < endDate;
      }).length;

      data.push({
        date: dateStr,
        leads: count
      });

      if (useMonthly) {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return data;
  };

  // Get revenue trend data
  const getRevenueTrendData = (period) => {
    const now = new Date();
    let startDate;
    let useMonthly = false;
    
    if (period === 'Week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'Month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else { // Year
      startDate = new Date(now.getFullYear(), 0, 1);
      useMonthly = true;
    }

    const filteredLeads = leads.filter(lead => 
      lead.status === 'Closed' && new Date(lead.updated_at) >= startDate
    );
    
    const data = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= now) {
      let dateStr;
      let endDate;
      
      if (useMonthly) {
        dateStr = currentDate.toLocaleDateString('en-US', { month: 'short' });
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      } else {
        dateStr = currentDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        endDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      }
      
      const revenue = filteredLeads
        .filter(lead => {
          const leadDate = new Date(lead.updated_at);
          return leadDate >= currentDate && leadDate < endDate;
        })
        .reduce((sum, lead) => sum + (lead.value || 0), 0);

      data.push({
        date: dateStr,
        revenue: revenue
      });

      if (useMonthly) {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return data;
  };

  const leadsInStagesData = getLeadsByStatus(leadsInStagesPeriod);
  const leadsTrendData = getLeadsTrendData(leadsTrendPeriod);
  const revenueTrendData = getRevenueTrendData(revenuePeriod);

  return (
    <div className="dashboard-home">
      {/* <div className="dashboard-welcome">
        <h1>Welcome back, {user.name?.split(' ')[0] || 'User'}! 👋</h1>
        <p>Here's what's happening with your leads today.</p>
      </div> */}

      <div className="metrics-grid">
        <MetricCard 
          title="Total Leads"
          value={totalLeads}
          change={0}
          changeType="positive"
          subtitle={`Total leads in pipeline`}
        />
        <MetricCard 
          title="This Month's Leads"
          value={thisMonthLeads}
          change={thisMonthChange}
          changeType={thisMonthChange >= 0 ? "positive" : "negative"}
          subtitle={`Last Month: ${lastMonthLeads}`}
        />
        <MetricCard 
          title="Contacts Created - This Month"
          value={contactsCreated}
          change={wonChange}
          changeType="positive"
          subtitle={`New contacts this month`}
        />
        <MetricCard 
          title="Pipelines Won - This Month"
          value={pipelinesWon}
          change={wonChange}
          changeType="positive"
          subtitle="Closed deals this month"
        />
        <MetricCard 
          title="Pipelines Lost - This Month"
          value={pipelinesLost}
          change={lostChange}
          changeType="positive"
          subtitle="Lost deals this month"
        />
        <MetricCard 
          title="Total Wins (All Time)"
          value={totalWonAllTime}
          change={0}
          changeType="positive"
          subtitle="All pipelines"
        />
        <MetricCard 
          title="Total Losses (All Time)"
          value={totalLostAllTime}
          change={0}
          changeType="negative"
          subtitle="All pipelines"
        />
      </div>

      <div className="charts-grid">
        <ChartCard 
          title="Leads In Stages"
          period={leadsInStagesPeriod}
          onPeriodChange={setLeadsInStagesPeriod}
        >
          <LeadsInStagesChart data={leadsInStagesData} />
        </ChartCard>
        <ChartCard 
          title="Leads Trend"
          period={leadsTrendPeriod}
          onPeriodChange={setLeadsTrendPeriod}
        >
          <LeadsTrendChart data={leadsTrendData} />
        </ChartCard>
        <LatestLeadCard lead={latestCompany} />
      </div>

      <div className="bottom-grid">
        <ChartCard 
          title="Revenue Track"
          period={revenuePeriod}
          onPeriodChange={setRevenuePeriod}
        >
          <RevenueTrendChart data={revenueTrendData} />
        </ChartCard>
        <LatestActivityCard leads={leads} />
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, changeType, subtitle }) {
  return (
    <div className="metric-card">
      <h3>{title}</h3>
      <div className="metric-value">
        <span className="value">{value}</span>
        <span className={`change ${changeType}`}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
      </div>
      <p className="metric-subtitle">{subtitle}</p>
    </div>
  );
}

function ChartCard({ title, children, period, onPeriodChange }) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>{title}</h3>
        <div className="chart-tabs">
          <span 
            className={`tab ${period === 'Week' ? 'active' : ''}`}
            onClick={() => onPeriodChange && onPeriodChange('Week')}
          >
            Week
          </span>
          <span 
            className={`tab ${period === 'Month' ? 'active' : ''}`}
            onClick={() => onPeriodChange && onPeriodChange('Month')}
          >
            Month
          </span>
          <span 
            className={`tab ${period === 'Year' ? 'active' : ''}`}
            onClick={() => onPeriodChange && onPeriodChange('Year')}
          >
            Year
          </span>
        </div>
      </div>
      <div className="chart-content">
        {children}
      </div>
    </div>
  );
}

function LeadsInStagesChart({ data }) {
  if (data.every(item => item.value === 0)) {
    return (
      <div className="coming-soon-box">
        <p>No data available for selected period</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#667eea" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function LeadsTrendChart({ data }) {
  if (data.length === 0 || data.every(item => item.leads === 0)) {
    return (
      <div className="coming-soon-box">
        <p>No data available for selected period</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="leads" 
          stroke="#667eea" 
          strokeWidth={2}
          dot={{ fill: '#667eea', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function RevenueTrendChart({ data }) {
  if (data.length === 0 || data.every(item => item.revenue === 0)) {
    return (
      <div className="coming-soon-box">
        <p>No revenue data available for selected period</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip 
          formatter={(value) => `$${value.toLocaleString()}`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#10b981" 
          strokeWidth={2}
          dot={{ fill: '#10b981', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function ComingSoonBox() {
  return (
    <div className="coming-soon-box">
      <p>Chart coming soon</p>
    </div>
  );
}

function LatestLeadCard({ lead }) {
  if (!lead) {
    return (
      <div className="latest-company-card">
        <div className="card-header">
          <h3>Latest Lead</h3>
          <span className="view-all">View All</span>
        </div>
        <div className="company-content">
          <p>No leads yet</p>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="latest-company-card">
      <div className="card-header">
        <h3>Latest Lead</h3>
        <span className="view-all">View All</span>
      </div>
      <div className="company-content">
        <h4>{lead.name}</h4>
        <p>Status: <strong>{lead.status}</strong></p>
        {lead.value > 0 && <p>Value: ${lead.value.toLocaleString()}</p>}
        <div className="company-meta">
          <span>{lead.location || 'N/A'}</span>
          <span>🔗</span>
        </div>
      </div>
    </div>
  );
}

function LatestActivityCard({ leads }) {
  // Get recent status changes
  const recentActivities = leads
    .filter(lead => lead.updated_at !== lead.created_at)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 3);

  if (recentActivities.length === 0) {
    return (
      <div className="latest-activity-card">
        <div className="card-header">
          <h3>Latest Activity</h3>
        </div>
        <div className="activity-list">
          <p style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
            No recent activity
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="latest-activity-card">
      <div className="card-header">
        <h3>Latest Activity</h3>
      </div>
      <div className="activity-list">
        {recentActivities.map((lead, idx) => {
          const getInitials = (name) => {
            if (!name) return '?';
            return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
          };

          const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          };

          return (
            <div key={idx} className="activity-item">
              <div className="activity-avatar">{getInitials(lead.name)}</div>
              <div className="activity-content">
                <h4>{lead.name}</h4>
                <p>Status changed to <strong>{lead.status}</strong></p>
                <span className="activity-time">{formatDate(lead.updated_at)}</span>
              </div>
              <button className="activity-type-btn">{lead.status}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardHome;
