import React, { useState, useEffect, useRef } from 'react';
import './GmailConnect.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';


function GmailConnect({ leadId }) {
  const [connecting, setConnecting] = useState(false);

  // OAuth connect function - redirects to backend OAuth URL
  const handleOAuthConnect = async () => {
    setConnecting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/gmail/oauth/url?leadId=${leadId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        toast.error('Failed to initiate OAuth flow');
        setConnecting(false);
      }
    } catch (error) {
      console.error('Error starting OAuth:', error);
      toast.error('Failed to connect Gmail');
      setConnecting(false);
    }
  };

  return (
    <div className="gmail-connect premium-card">
      <ToastContainer 
        position="top-right" 
        autoClose={3500} 
        hideProgressBar 
        newestOnTop 
        closeOnClick 
        pauseOnHover 
        theme="colored" 
        className="premium-toast"
      />
      
      <div className="premium-card-header">
        <div className="header-left">
          <div className="service-logo">
            <div className="logo-background">
              <img 
                src="https://www.gstatic.com/images/branding/product/2x/gmail_2020q4_48dp.png" 
                alt="Gmail" 
              />
            </div>
          </div>
          <div className="header-text">
            <h3 className="service-title">Gmail Integration</h3>
            <p className="service-subtitle">Sync emails with your leads</p>
          </div>
        </div>
      </div>
        <div className="setup-state premium-section">
          <div className="info-card">
            <div className="info-icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <div className="info-content">
              <h4>Connect Your Gmail</h4>
              <p>Automatically sync incoming emails and match them to your leads in real-time</p>
            </div>
          </div>
          
          <div className="benefits-list">
            <div className="benefit-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Real-time email syncing</span>
            </div>
            <div className="benefit-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Automatic lead matching</span>
            </div>
            <div className="benefit-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Secure OAuth 2.0 connection</span>
            </div>
          </div>
          
          <div className="connect-button-container">
            <button 
              className="connect-btn premium-btn" 
              onClick={handleOAuthConnect} 
              disabled={connecting}
            >
              {connecting ? (
                <span className="btn-loader"></span>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  Connect with Google
                </>
              )}
            </button>
            <p className="security-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Your data is secured with OAuth 2.0
            </p>
          </div>
        </div>
    </div>
  );
}

export default GmailConnect;