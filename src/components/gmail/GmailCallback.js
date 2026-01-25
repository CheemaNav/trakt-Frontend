import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Helper to parse query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function GmailCallback() {
  const navigate = useNavigate();
  const query = useQuery();

  useEffect(() => {
    const code = query.get('code');
    const leadId = query.get('leadId');
    const customer_email = query.get('customer_email');
    const token = localStorage.getItem('token');

    if (!code || !leadId) {
      alert('Missing code or leadId in callback URL.');
      navigate('/');
      return;
    }

    // Exchange code for tokens
    fetch(`${API_URL}/gmail/oauth-callback?code=${encodeURIComponent(code)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(async (data) => {
        if (data.tokens) {
          // Store tokens in lead_gmail_connections
          const connectRes = await fetch(`${API_URL}/leads/${leadId}/gmail/connect`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              customer_email: customer_email || '',
              access_token: data.tokens.access_token,
              refresh_token: data.tokens.refresh_token,
              expiry_date: data.tokens.expiry_date,
              token_type: data.tokens.token_type || 'Bearer'
            })
          });
          if (connectRes.ok) {
            alert('Gmail connected successfully!');
            navigate(`/leads/${leadId}`);
          } else {
            alert('Failed to save Gmail tokens for this lead.');
            navigate(`/leads/${leadId}`);
          }
        } else {
          alert('Failed to get tokens from Google.');
          navigate(`/leads/${leadId}`);
        }
      })
      .catch(() => {
        alert('OAuth callback failed.');
        navigate(`/leads/${leadId}`);
      });
  }, [navigate, query]);

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>Connecting Gmail...</h2>
      <p>Please wait while we complete the Gmail connection.</p>
    </div>
  );
}

export default GmailCallback;
