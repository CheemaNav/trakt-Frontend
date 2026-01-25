import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { DashboardHome, Profile, UserManagement } from '../pages';
import { Leads } from '../leads';
import LeadDetail from '../leads/LeadDetail';
import Contacts from '../contacts';
import Organizations from '../organizations';
import Reports from '../reports';
import Products from '../products';
import { PipelineAdd } from '../pipelines';
import PipelineEdit from '../pipelines/PipelineEdit';
import CalendarPage from '../calendar';
import './Dashboard.css';

function ComingSoon({ page }) {
  return (
    <div className="coming-soon">
      <div className="coming-soon-content">
        <h1>{page}</h1>
        <p>This page is coming soon</p>
        <div className="coming-soon-icon">🚀</div>
      </div>
    </div>
  );
}

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <TopBar user={user} />
        <div className="dashboard-content">
          <Routes>
            <Route path="/dashboard" element={<DashboardHome user={user} />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/leads/:id" element={<LeadDetail />} />
            <Route path="/pipeline/add" element={<PipelineAdd />} />
            <Route path="/pipeline/edit/:id" element={<PipelineEdit />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/organization" element={<Organizations />} />
            <Route path="/products" element={<Products />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/activities" element={<ComingSoon page="Activities" />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/activity-logs" element={<ComingSoon page="Activity Logs" />} />
            <Route path="/account-setup" element={<ComingSoon page="Account Setup" />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
