import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GmailConnect } from '../../gmail';
import './Gmail.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Close Icon
const CloseIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Icons
const MailIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <path d="M22 6l-10 7-10-7" />
  </svg>
);

const CheckCircleIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const LoadingIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="1">
      <animate attributeName="r" values="1;8" dur="1.5s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="1;0" dur="1.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="12" cy="12" r="1" />
  </svg>
);

const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const RefreshIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74" />
    <path d="M21 3v6h-6" />
    <path d="M3 21v-6h6" />
  </svg>
);

const ComposeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M3 20.5v-4l11-11 4 4-11 11h-4z" />
    <path d="M14.5 5.5l4 4" />
  </svg>
);

const ReplyIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M9 10l-5 5 5 5" />
    <path d="M20 4v7a4 4 0 01-4 4H4" />
  </svg>
);

const WarningIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
    <path d="M10.29 3.86 2.82 17a1 1 0 0 0 .87 1.5h16.62a1 1 0 0 0 .87-1.5L12.71 3.86a1 1 0 0 0-1.72 0Z" />
  </svg>
);

// Custom Rich Text Editor Component
const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <button type="button" onClick={() => execCommand('bold')} title="Bold (Ctrl+B)" className="toolbar-btn">
          <strong>B</strong>
        </button>
        <button type="button" onClick={() => execCommand('italic')} title="Italic (Ctrl+I)" className="toolbar-btn">
          <em>I</em>
        </button>
        <button type="button" onClick={() => execCommand('underline')} title="Underline (Ctrl+U)" className="toolbar-btn">
          <u>U</u>
        </button>
        <button type="button" onClick={() => execCommand('strikeThrough')} title="Strikethrough" className="toolbar-btn">
          <s>S</s>
        </button>
        <div className="toolbar-divider" />
        <button type="button" onClick={() => execCommand('insertUnorderedList')} title="Bullet List" className="toolbar-btn">
          ☰
        </button>
        <button type="button" onClick={() => execCommand('insertOrderedList')} title="Numbered List" className="toolbar-btn">
          1.
        </button>
        <div className="toolbar-divider" />
        <button type="button" onClick={() => execCommand('justifyLeft')} title="Align Left" className="toolbar-btn">
          ≡
        </button>
        <button type="button" onClick={() => execCommand('justifyCenter')} title="Align Center" className="toolbar-btn">
          ≡
        </button>
        <button type="button" onClick={() => execCommand('justifyRight')} title="Align Right" className="toolbar-btn">
          ≡
        </button>
        <div className="toolbar-divider" />
        <button type="button" onClick={() => execCommand('formatBlock', 'h1')} title="Heading 1" className="toolbar-btn">
          H1
        </button>
        <button type="button" onClick={() => execCommand('formatBlock', 'h2')} title="Heading 2" className="toolbar-btn">
          H2
        </button>
        <button type="button" onClick={() => execCommand('formatBlock', 'h3')} title="Heading 3" className="toolbar-btn">
          H3
        </button>
        <div className="toolbar-divider" />
        <button type="button" onClick={() => {
          const url = prompt('Enter URL:');
          if (url) execCommand('createLink', url);
        }} title="Insert Link" className="toolbar-btn">
          🔗
        </button>
        <button type="button" onClick={() => execCommand('removeFormat')} title="Clear Formatting" className="toolbar-btn">
          ✕
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="editor-content"
        data-placeholder={placeholder}
      />
    </div>
  );
};

function GmailTab({ leadId, onEmailsChange }) {
  const [step, setStep] = useState('checking');
  const [customerEmail, setCustomerEmail] = useState('');
  const [emailOptions, setEmailOptions] = useState([]); // For email selection UI
  const [leadGmailData, setLeadGmailData] = useState(null);
  const [leadData, setLeadData] = useState(null);
  const [emailSelectionMode, setEmailSelectionMode] = useState(null); // 'lead' or 'custom'
  const [emails, setEmails] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [activeTab, setActiveTab] = useState('emails'); // 'emails', 'drafts', 'scheduled'
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const previousEmailCountRef = useRef(0);
  const [showCompose, setShowCompose] = useState(false);
  // Attachment state for compose box
  const [attachments, setAttachments] = useState([]);
  const [composeData, setComposeData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    bodyHtml: ''
  });
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [composeMode, setComposeMode] = useState('new'); // 'new' or 'reply'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sending, setSending] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [editingDraftId, setEditingDraftId] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showTemplateSelect, setShowTemplateSelect] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    cc: '',
    bcc: '',
    bodyHtml: ''
  });
  // Remove manual token entry state
  const [loadingEmails, setLoadingEmails] = useState(false);
  // Manual token entry state (for customer-email-old step)

  // Define fetchEmails early so it can be used by checkStatus
  const fetchEmails = useCallback(async (showToast = false, sync = false) => {
    setSyncing(true); // Show syncing indicator when sync is requested
    setLoadingEmails(true);
    try {
      const token = localStorage.getItem('token');
      const url = sync 
        ? `${API_URL}/leads/${leadId}/emails?sync=true`
        : `${API_URL}/leads/${leadId}/emails`;

      console.log('Fetching emails from:', url);

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('Emails response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Emails data:', data);
        const emailsList = data.emails || [];

        // Always set emails from the first response instantly
        const oldCount = previousEmailCountRef.current;
        previousEmailCountRef.current = emailsList.length;
        setEmails(emailsList);
        if (onEmailsChange) {
          onEmailsChange(emailsList.length);
        }
        setLoadingEmails(false);

        // Show toast for new emails if needed
        if (showToast && oldCount > 0) {
          const newEmailCount = emailsList.length - oldCount;
          if (newEmailCount > 0) {
            setToast(`${newEmailCount} new email${newEmailCount > 1 ? 's' : ''}`);
            setTimeout(() => setToast(null), 3000);
          }
        }
        setTimeout(() =>
        setSyncing(false), 2000); // Keep syncing indicator for a bit longer for better UX
      } else if (response.status === 401) {
        setLoadingEmails(false);
        setSyncing(false);
        const errorData = await response.json();
        console.error('Auth error fetching emails:', errorData);
        setError(errorData.error || 'Gmail token expired. Reconnecting...');
        setStep('oauth-setup'); // Reset to OAuth setup instead of calling handleDisconnect
      } else {
        setLoadingEmails(false);
        setSyncing(false);
        const errorData = await response.json();
        console.error('Error fetching emails:', errorData);
        setError(errorData.error || 'Failed to fetch emails');
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError('Error fetching emails: ' + error.message);
      setLoadingEmails(false);
      setSyncing(false);
    }
  }, [leadId, onEmailsChange]);

  // Only fetch on initial mount or leadId change
  useEffect(() => {
    let didCancel = false;
    const fetchAll = async () => {
      setLoading(true);
      await checkStatus();
      await fetchTemplates();
      if (!didCancel) setLoading(false);
    };
    fetchAll();
    return () => { didCancel = true; };
  }, [leadId]);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/email-templates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateForm.name) {
      setError('Template name is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/email-templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: templateForm.name,
          subject: templateForm.subject,
          cc_email: templateForm.cc,
          bcc_email: templateForm.bcc,
          body_html: templateForm.bodyHtml
        })
      });

      if (response.ok) {
        setToast('Template created successfully');
        setTimeout(() => setToast(null), 3000);
        setShowCreateTemplate(false);
        setTemplateForm({ name: '', subject: '', cc: '', bcc: '', bodyHtml: '' });
        fetchTemplates();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      setError('Failed to create template');
    }
  };

  const handleSelectTemplate = (template) => {
    setComposeData({
      ...composeData,
      subject: template.subject || '',
      cc: template.cc_email || '',
      bcc: template.bcc_email || '',
      bodyHtml: template.body_html || ''
    });
    setShowCc(!!template.cc_email);
    setShowBcc(!!template.bcc_email);
    setShowTemplateSelect(false);
    setToast(`Template "${template.name}" applied`);
    setTimeout(() => setToast(null), 3000);
  };

  const checkStatus = async () => {
    console.log('checkStatus called for leadId:', leadId);
    try {
      const token = localStorage.getItem('token');
      // Fetch lead data to get person email(s)
      const leadDataResponse = await fetch(`${API_URL}/leads/${leadId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (leadDataResponse.ok) {
        const leadResponse = await leadDataResponse.json();
        setLeadData(leadResponse.lead || leadResponse.deal);
      }
      const gmailResponse = await fetch(`${API_URL}/leads/${leadId}/gmail`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (gmailResponse.ok) {
        const gmailData = await gmailResponse.json();
        if (gmailData.connected) {
          setStep('connected');
          await fetchEmails(true, true);
          await fetchDrafts();
          await fetchScheduled();
        } else {
          // If person_email or customer_email exists, show selection UI
          const emails = [];
          if (gmailData.person_email) emails.push(gmailData.person_email);
          if (gmailData.customer_email && gmailData.customer_email !== gmailData.person_email) emails.push(gmailData.customer_email);
          setEmailOptions(emails);
          setStep('select-email');
        }
      }
    } catch (error) {
      console.error('Error checking status:', error);
      setStep('select-email');
    }
  };

  const handleSync = async () => {
    console.log('Manual sync button clicked');
    setError('');
    // Directly call fetchEmails with sync=true to trigger backend sync
    await fetchEmails(true, true);
  };

  const fetchDrafts = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching drafts for lead:', leadId);
      const response = await fetch(`${API_URL}/leads/${leadId}/gmail/drafts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('Drafts response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Drafts data:', data);
        setDrafts(data.drafts || []);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error fetching drafts:', error);
    }
  };

  const fetchScheduled = async () => {
    try {
      setSyncing(true);
      const token = localStorage.getItem('token');
      console.log('Fetching scheduled for lead:', leadId);
      const response = await fetch(`${API_URL}/leads/${leadId}/gmail/scheduled`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('Scheduled response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Scheduled data:', data);
        setScheduled(data.scheduled || []);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error fetching scheduled emails:', error);
    }
    finally {
      setSyncing(false);
    }
  };

  const handleDeleteDraft = async (draftId) => {
    if (!window.confirm('Delete this draft?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads/${leadId}/gmail/drafts/${draftId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setToast('Draft deleted successfully');
        setTimeout(() => setToast(null), 3000);
        fetchDrafts();
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      setError('Error deleting draft');
    }
  };

  const handleDeleteScheduled = async (scheduleId) => {
    if (!window.confirm('Delete this scheduled email?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads/${leadId}/gmail/scheduled/${scheduleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setToast('Scheduled email deleted successfully');
        setTimeout(() => setToast(null), 3000);
        fetchScheduled();
      }
    } catch (error) {
      console.error('Error deleting scheduled email:', error);
      setError('Error deleting scheduled email');
    }
  };

  const handleDisconnect = async (skipConfirm = false) => {
    if (!skipConfirm && !window.confirm('Disconnect Gmail from this deal?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/leads/${leadId}/gmail/disconnect`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Reset to initial state but keep customer email
      setDrafts([]);
      setScheduled([]);
      setLeadGmailData(null);
      setError('');
      setLoading(false);
      setSyncing(false);
      setStep('select-email');  
      checkStatus();
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to disconnect Gmail');
    }
  };

  const handleUpdateCustomerEmail = async (email) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads/${leadId}/gmail/customer-email`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ customer_email: email })
      });

      if (response.ok) {
        setCustomerEmail(email);
        setStep('oauth-setup');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save customer email');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error saving customer email: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompose = () => {
    setComposeData({
      to: customerEmail,
      cc: '',
      bcc: '',
      subject: '',
      bodyHtml: ''
    });
    setShowCc(false);
    setShowBcc(false);
    setEditingDraftId(null);
    setComposeMode('new');
    setShowCompose(true);
  };

  const handleCloseCompose = () => {
    setShowCompose(false);
    setEditingDraftId(null);
  };

  const handleViewEmail = (email) => {
    // Open email in compose drawer for viewing
    const emailContent = `
      <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
        <div style="margin-bottom: 8px;"><strong>From:</strong> ${email.from_name || email.from_email}</div>
        <div style="margin-bottom: 8px;"><strong>To:</strong> ${email.to_email}</div>
        <div style="margin-bottom: 8px;"><strong>Date:</strong> ${new Date(email.received_date).toLocaleString()}</div>
        <div style="margin-bottom: 8px;"><strong>Subject:</strong> ${email.subject || '(No subject)'}</div>
      </div>
      ${email.body_html || `<pre style="white-space: pre-wrap; font-family: inherit;">${email.body_text || ''}</pre>`}
    `;
    
    setComposeData({
      to: email.from_email,
      cc: '',
      bcc: '',
      subject: email.subject || '(No subject)',
      bodyHtml: emailContent
    });
    setShowCc(false);
    setShowBcc(false);
    setComposeMode('view');
    setSelectedEmail(email);
    setShowCompose(true);
  };

  const handleReply = (email) => {
    const originalMessage = `
      <br/><br/>
      <div style="border-left: 3px solid #ccc; padding-left: 10px; margin-top: 20px; color: #666;">
        <strong>--- Original Message ---</strong><br/>
        <strong>From:</strong> ${email.from_email}<br/>
        <strong>Date:</strong> ${new Date(email.received_date).toLocaleString()}<br/>
        <strong>Subject:</strong> ${email.subject}<br/><br/>
        ${email.body_html || `<pre>${email.body_text || ''}</pre>`}
      </div>
    `;
    
    setComposeData({
      to: email.from_email,
      cc: '',
      bcc: '',
      subject: email.subject.startsWith('Re: ') ? email.subject : `Re: ${email.subject}`,
      bodyHtml: originalMessage
    });
    setShowCc(false);
    setShowBcc(false);
    setComposeMode('reply');
    setSelectedEmail(null);
    setShowCompose(true);
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const draftData = {
        to: composeData.to,
        cc: composeData.cc,
        bcc: composeData.bcc,
        subject: composeData.subject,
        bodyHtml: composeData.bodyHtml
      };
      console.log('Saving draft:', draftData);
      
      const response = await fetch(`${API_URL}/leads/${leadId}/gmail/draft`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(draftData)
      });

      console.log('Draft save response status:', response.status);
      if (response.ok) {
        const result = await response.json();
        console.log('Draft saved:', result);
        
        // If updating an existing draft, delete the old one
        if (editingDraftId) {
          await fetch(`${API_URL}/leads/${leadId}/gmail/drafts/${editingDraftId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setEditingDraftId(null);
        }
        
        setToast('Draft saved successfully!');
        setTimeout(() => setToast(null), 3000);
        setShowCompose(false);
        setComposeData({ to: '', cc: '', bcc: '', subject: '', bodyHtml: '' });
        setShowCc(false);
        setShowBcc(false);
        fetchDrafts();
      } else {
        const errorData = await response.json();
        console.error('Draft save error:', errorData);
        setError(errorData.error || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setError('Error saving draft: ' + error.message);
    } finally {
      setSavingDraft(false);
    }
  };

  const handleScheduleEmail = async () => {
    if (!scheduleDate || !scheduleTime) {
      setError('Please select date and time');
      return;
    }

    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    
    if (scheduledDateTime <= new Date()) {
      setError('Scheduled time must be in the future');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const scheduleData = {
        to: composeData.to,
        cc: composeData.cc,
        bcc: composeData.bcc,
        subject: composeData.subject,
        bodyHtml: composeData.bodyHtml,
        scheduledTime: scheduledDateTime.toISOString()
      };
      console.log('Scheduling email:', scheduleData);
      
      const response = await fetch(`${API_URL}/leads/${leadId}/gmail/schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scheduleData)
      });

      console.log('Schedule response status:', response.status);
      if (response.ok) {
        const result = await response.json();
        console.log('Email scheduled:', result);
        // If editing a draft, delete it after scheduling
        if (editingDraftId) {
          await fetch(`${API_URL}/leads/${leadId}/gmail/drafts/${editingDraftId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setEditingDraftId(null);
        }
        
        setToast('Email scheduled successfully!');
        setTimeout(() => setToast(null), 3000);
        setShowCompose(false);
        setShowScheduleModal(false);
        setComposeData({ to: '', cc: '', bcc: '', subject: '', bodyHtml: '' });
        setShowCc(false);
        setShowBcc(false);
        setScheduleDate('');
        setScheduleTime('');
        fetchScheduled();
        fetchDrafts();
      } else {
        const errorData = await response.json();
        console.error('Schedule failed:', errorData);
        setError(errorData.error || 'Failed to schedule email');
      }
    } catch (error) {
      console.error('Error scheduling email:', error);
      setError('Error scheduling email: ' + error.message);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads/${leadId}/gmail/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: composeData.to,
          cc: composeData.cc,
          bcc: composeData.bcc,
          subject: composeData.subject,
          bodyHtml: composeData.bodyHtml
        })
      });

      if (response.ok) {
        // If editing a draft, delete it after sending
        if (editingDraftId) {
          await fetch(`${API_URL}/leads/${leadId}/gmail/drafts/${editingDraftId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setEditingDraftId(null);
        }
        
        setToast('Email sent successfully!');
        setTimeout(() => setToast(null), 3000);
        setShowCompose(false);
        setComposeData({ to: '', cc: '', bcc: '', subject: '', bodyHtml: '' });
        setShowCc(false);
        setShowBcc(false);
        fetchDrafts();
        // Refresh emails after sending
        setTimeout(() => fetchEmails(true, true), 1000);
      } else if (response.status === 401) {
        const errorData = await response.json();
        setError(errorData.error || 'Gmail token expired. Reconnecting...');
        await handleDisconnect(true);
        setShowCompose(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setError('Error sending email: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Pagination helper functions
  const getPaginatedData = (data) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return data.slice(indexOfFirstItem, indexOfLastItem);
  };

  const getTotalPages = (data) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when switching tabs
  };

  // Get paginated data based on active tab
  const paginatedEmails = getPaginatedData(emails);
  const paginatedDrafts = getPaginatedData(drafts);
  const paginatedScheduled = getPaginatedData(scheduled);

  // Pagination component
  const Pagination = ({ totalItems, currentData }) => {
    const totalPages = getTotalPages(totalItems);
    
    if (totalPages <= 1) return null;

    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <div className="pagination-info">
          Page {currentPage} of {totalPages} ({totalItems.length} total)
        </div>
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="gmail-tab">
      {toast && (
        <div className="toast-notification">
          {toast}
        </div>
      )}
      
      {error && (
        <div className="gmail-error">
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {step === 'select-email' && (
        <div className="setup-container">
          <div className="setup-box compact">
            <div className="setup-icon small">
              <MailIcon style={{ width: 48, height: 48, color: '#667eea' }} />
            </div>
            <h3>Select Customer Email</h3>
            <p>Select an email to continue, or use a different one.</p>
            {emailOptions.map((email) => (
              <button
                key={email}
                className="btn btn-primary"
                style={{ margin: '8px 0', width: '100%', fontWeight: 500, fontSize: 16, borderRadius: 8, padding: '12px 0' }}
                onClick={() => {
                  setCustomerEmail(email);
                  handleUpdateCustomerEmail(email);
                  setStep('oauth-setup');
                }}
                disabled={loading}
              >
                Continue with {email}
              </button>
            ))}
            <div style={{ margin: '16px 0', textAlign: 'center', color: '#888' }}>or</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Enter another email"
                className="form-input"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: 8,
                  fontSize: 16,
                  outline: 'none',
                  marginBottom: 0,
                  background: loading ? '#f3f4f6' : '#fff',
                  transition: 'border 0.2s',
                }}
                onFocus={e => e.target.style.border = '1.5px solid #667eea'}
                onBlur={e => e.target.style.border = '1.5px solid #cbd5e1'}
              />
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (customerEmail) {
                    handleUpdateCustomerEmail(customerEmail);
                    setStep('oauth-setup');
                  }
                }}
                disabled={loading || !customerEmail}
                style={{
                  minWidth: 120,
                  fontWeight: 600,
                  fontSize: 15,
                  borderRadius: 8,
                  padding: '12px 0',
                  background: loading || !customerEmail ? '#cbd5e1' : '#667eea',
                  color: loading || !customerEmail ? '#888' : '#fff',
                  cursor: loading || !customerEmail ? 'not-allowed' : 'pointer',
                  boxShadow: '0 1px 4px 0 rgba(102,126,234,0.08)',
                  border: 'none',
                  transition: 'background 0.2s',
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'oauth-setup' && (
        <div className="setup-container">
          <GmailConnect onConnected={checkStatus} leadId={leadId} />
        </div>
      )}

      {step === 'connected' && (
        <div className="gmail-connected">
          <div className="gmail-header-unified">
            <div className="gmail-tabs">
              <button 
                className={`gmail-tab-btn ${activeTab === 'emails' ? 'active' : ''}`}
                onClick={() => handleTabChange('emails')}
              >
                <MailIcon />
                Emails ({emails.length})
              </button>
              <button 
                className={`gmail-tab-btn ${activeTab === 'drafts' ? 'active' : ''}`}
                onClick={() => handleTabChange('drafts')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Drafts ({drafts.length})
              </button>
              <button 
                className={`gmail-tab-btn ${activeTab === 'scheduled' ? 'active' : ''}`}
                onClick={() => handleTabChange('scheduled')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Scheduled ({scheduled.length})
              </button>
            </div>
            
            <div className="header-buttons">
              <button className="btn-compose" onClick={handleCompose} title="Compose Email">
                <ComposeIcon />
                <span>Compose</span>
              </button>
              <button className="btn-sync" onClick={handleSync} disabled={syncing || loadingEmails} title="Refresh emails">
                <RefreshIcon className={syncing || loadingEmails ? 'spinning' : ''} />
              </button>
              <button className="btn-disconnect" onClick={handleDisconnect} title="Disconnect Gmail">
                ✕
              </button>
            </div>
          </div>

          <div className="emails-wrapper">
            {activeTab === 'emails' && (
              <div className="emails-table-container">
                {emails.length === 0 ? (
                  <div className="empty-state">
                    {loadingEmails ? (
                      <>
                        <LoadingIcon style={{ width: 32, height: 32, marginBottom: 8 }} />
                        <p>Loading emails...</p>
                      </>
                    ) : (
                      <>
                        <MailIcon />
                        <p>No emails yet</p>
                        <small>Emails will appear here</small>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <table className="emails-table">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>From</th>
                          <th>To</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedEmails.map((email) => (
                          <tr
                            key={email.id}
                            className={`email-row ${email.is_unread ? 'unread' : ''}`}
                            onClick={() => handleViewEmail(email)}
                          >
                            <td className="subject-cell">
                              {email.is_unread && <span className="unread-badge">●</span>}
                              <span className="subject-text">{email.subject || '(No subject)'}</span>
                            </td>
                            <td className="from-cell">{email.from_name || email.from_email}</td>
                            <td className="to-cell">{email.to_email}</td>
                            <td className="date-cell">{formatDate(email.received_date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <Pagination totalItems={emails} currentData={paginatedEmails} />
                  </>
                )}
              </div>
            )}

            {activeTab === 'drafts' && (
              <div className="emails-table-container">
                {drafts.length === 0 ? (
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/>
                      <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    <p>No drafts</p>
                    <small>Your saved drafts will appear here</small>
                  </div>
                ) : (
                  <>
                    <table className="emails-table">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>To</th>
                          <th>Last Modified</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedDrafts.map((draft) => (
                          <tr key={draft.id} className="email-row draft-row">
                            <td className="subject-cell">
                              <span className="draft-badge">Draft</span>
                              <span className="subject-text">{draft.subject || '(No subject)'}</span>
                            </td>
                            <td className="to-cell">{draft.to_email}</td>
                            <td className="date-cell">{formatDate(draft.updated_at || draft.created_at)}</td>
                            <td className="actions-cell">
                              <button 
                                className="btn-table-action edit"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setComposeData({
                                    to: draft.to_email,
                                    cc: draft.cc_email || '',
                                    bcc: draft.bcc_email || '',
                                    subject: draft.subject,
                                    bodyHtml: draft.body_html
                                  });
                                  setShowCc(draft.cc_email ? true : false);
                                  setShowBcc(draft.bcc_email ? true : false);
                                  setEditingDraftId(draft.id);
                                  setComposeMode('new');
                                  setShowCompose(true);
                                }}
                              >
                                Edit
                              </button>
                              <button 
                                className="btn-table-action delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDraft(draft.id);
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <Pagination totalItems={drafts} currentData={paginatedDrafts} />
                  </>
                )}
              </div>
            )}

            {activeTab === 'scheduled' && (
              <div className="emails-table-container">
                {scheduled.length === 0 ? (
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <p>No scheduled emails</p>
                    <small>Your scheduled emails will appear here</small>
                  </div>
                ) : (
                  <>
                    <table className="emails-table">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>To</th>
                          <th>Scheduled Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedScheduled.map((sched) => (
                          <tr key={sched.id} className={`email-row scheduled-row ${sched.status === 'failed' ? 'failed-row' : ''}`}> 
                            <td className="subject-cell">
                              <span className={`scheduled-badge ${sched.status}`}>
                                {sched.status === 'sent' && 'Sent'}
                                {sched.status === 'Scheduled' && 'Scheduled'}
                                {sched.status === 'pending' && 'Scheduled'}
                                {sched.status === 'failed' && (
                                  <>
                                    Failed
                                    <span style={{color:'#ef4444',marginLeft:6,fontWeight:600}} title={sched.error || 'Failed to send'}>⚠️</span>
                                  </>
                                )}
                              </span>
                              <span className="subject-text">{sched.subject || '(No subject)'}</span>
                            </td>
                            <td className="to-cell">{sched.to_email}</td>
                            <td className="date-cell">{formatDate(sched.scheduled_time)}</td>
                            <td className="status-cell">
                              <span className={`status-indicator ${sched.status}`}>{sched.status}</span>
                              {sched.status === 'failed' && sched.error && (
                                <div className="failed-error-message" style={{color:'#ef4444',fontSize:'0.85em',marginTop:2}}>
                                  {sched.error}
                                </div>
                              )}
                            </td>
                            <td className="actions-cell">
                              {sched.status === 'pending' && (
                                <>
                                  <button 
                                    className="btn-table-action edit"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setComposeData({
                                        to: sched.to_email,
                                        cc: sched.cc_email || '',
                                        bcc: sched.bcc_email || '',
                                        subject: sched.subject,
                                        bodyHtml: sched.body_html
                                      });
                                      setShowCc(!!sched.cc_email);
                                      setShowBcc(!!sched.bcc_email);
                                      setEditingDraftId(null);
                                      setScheduleDate(sched.scheduled_time ? new Date(sched.scheduled_time).toISOString().split('T')[0] : '');
                                      setScheduleTime(sched.scheduled_time ? new Date(sched.scheduled_time).toISOString().slice(11,16) : '');
                                      setComposeMode('scheduled-edit');
                                      setShowCompose(true);
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    className="btn-table-action delete"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteScheduled(sched.id);
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <Pagination totalItems={scheduled} currentData={paginatedScheduled} />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Removed modal popup for selectedEmail. Only compose drawer will open now. */}

          {showCompose && (
            <>
              <div className="drawer-overlay" onClick={handleCloseCompose} />
              <div className="email-drawer-fullscreen">
                <div className="drawer-header">
                  <div className="drawer-title">
                    <h3>
                      {composeMode === 'view' ? composeData.subject : (composeMode === 'reply' ? 'Reply' : 'New Message')}
                    </h3>
                  </div>
                  <div className="drawer-actions">
                    {composeMode === 'view' ? (
                      <button 
                        type="button" 
                        className="btn-action-primary" 
                        onClick={() => handleReply(selectedEmail)}
                        title="Reply to this email"
                      >
                        <ReplyIcon />
                        Reply
                      </button>
                    ) : (
                      <>
                        <div className="template-select-container">
                          <select
                            className="btn-action-secondary btn-template-select"
                            onChange={(e) => {
                              const templateId = e.target.value;
                              if (templateId) {
                                const template = templates.find(t => t.id === parseInt(templateId));
                                if (template) {
                                  handleSelectTemplate(template);
                                }
                                e.target.value = '';
                              }
                            }}
                            value=""
                          >
                            <option value="">Select Template</option>
                            {templates.map((template) => (
                              <option key={template.id} value={template.id}>
                                {template.name}
                              </option>
                            ))}
                          </select>
                          <svg className="select-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                        </div>
                        <button
                          type="button"
                          className="btn-action-secondary btn-template-header"
                          onClick={() => setShowCreateTemplate(true)}
                          title="Create a new template"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="12" y1="11" x2="12" y2="17"/>
                            <line x1="9" y1="14" x2="15" y2="14"/>
                          </svg>
                          Create Template
                        </button>
                        <button 
                          type="button" 
                          className="btn-action-secondary"
                          onClick={handleSaveDraft}
                          disabled={savingDraft || sending}
                          title="Save Draft"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 01-2-2V5a2 4 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                            <polyline points="17 21 17 13 7 13 7 21"/>
                            <polyline points="7 3 7 8 15 8"/>
                          </svg>
                          {savingDraft ? 'Saving...' : 'Draft'}
                        </button>
                        <button 
                          type="button" 
                          className="btn-action-secondary"
                          onClick={() => setShowScheduleModal(true)}
                          disabled={sending || savingDraft}
                          title="Schedule Send"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                          </svg>
                          Schedule
                        </button>
                        <button 
                          type="button" 
                          className="btn-action-primary" 
                          onClick={handleSendEmail}
                          disabled={sending || savingDraft}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13"/>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                          </svg>
                          {sending ? 'Sending...' : 'Send'}
                        </button>
                      </>
                    )}
                    <button className="btn-close-drawer" onClick={handleCloseCompose} title="Close">
                      <CloseIcon />
                    </button>
                  </div>
                </div>

                <div className="drawer-body-fullscreen">
                  {composeMode === 'view' ? (
                    <div className="email-view-content">
                      <div
                        dangerouslySetInnerHTML={{ __html: composeData.bodyHtml }}
                        className="email-html"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="compose-fields-compact">
                        <div className="compose-field-row">
                          <span className="field-label">To</span>
                          <div className="field-input-group">
                            <input
                              type="email"
                              value={composeData.to}
                              onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                              required
                              placeholder="recipient@example.com"
                              className="field-input"
                            />
                            <div className="field-toggle-btns">
                              {!showCc && (
                                <button type="button" className="btn-toggle" onClick={() => setShowCc(true)}>
                                  Cc
                                </button>
                              )}
                              {!showBcc && (
                                <button type="button" className="btn-toggle" onClick={() => setShowBcc(true)}>
                                  Bcc
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {showCc && (
                          <div className="compose-field-row">
                            <span className="field-label">Cc</span>
                            <div className="field-input-group">
                              <input
                                type="email"
                                value={composeData.cc}
                                onChange={(e) => setComposeData({ ...composeData, cc: e.target.value })}
                                placeholder="cc@example.com"
                                className="field-input"
                              />
                              <button type="button" className="btn-remove" onClick={() => { setShowCc(false); setComposeData({ ...composeData, cc: '' }); }}>×</button>
                            </div>
                          </div>
                        )}
                        
                        {showBcc && (
                          <div className="compose-field-row">
                            <span className="field-label">Bcc</span>
                            <div className="field-input-group">
                              <input
                                type="email"
                                value={composeData.bcc}
                                onChange={(e) => setComposeData({ ...composeData, bcc: e.target.value })}
                                placeholder="bcc@example.com"
                                className="field-input"
                              />
                              <button type="button" className="btn-remove" onClick={() => { setShowBcc(false); setComposeData({ ...composeData, bcc: '' }); }}>×</button>
                            </div>
                          </div>
                        )}
                        
                        <div className="compose-field-row">
                          <span className="field-label">Subject</span>
                          <input
                            type="text"
                            value={composeData.subject}
                            onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                            required
                            placeholder="Email subject"
                            className="field-input"
                          />
                        </div>
                      </div>
                      
                      <div className="compose-editor-fullscreen">
                        <RichTextEditor
                          value={composeData.bodyHtml}
                          onChange={(content) => setComposeData({ ...composeData, bodyHtml: content })}
                          placeholder="Type your message here..."
                        />
                      </div>
                      <div className="compose-attachments-row improved-attachments-row">
                        <label className="attachment-label improved-attachment-label">
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.bmp,.webp,.svg,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            style={{ display: 'none' }}
                            onChange={e => {
                              const files = Array.from(e.target.files || []);
                              // Only allow allowed types
                              const allowed = files.filter(f =>
                                [
                                  'application/pdf',
                                  'application/msword',
                                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                  'application/vnd.ms-excel',
                                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                  'image/png',
                                  'image/jpeg',
                                  'image/jpg',
                                  'image/gif',
                                  'image/bmp',
                                  'image/webp',
                                  'image/svg+xml'
                                ].includes(f.type) ||
                                /\.(pdf|doc|docx|xls|xlsx|png|jpg|jpeg|gif|bmp|webp|svg)$/i.test(f.name)
                              );
                              setAttachments(allowed);
                            }}
                          />
                          <span className="btn-attach square-attach-btn" title="Attach Files">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><path d="M21.44 11.05l-9.19 9.19a5.5 5.5 0 0 1-7.78-7.78l10.6-10.6a3.5 3.5 0 0 1 4.95 4.95l-10.6 10.6a1.5 1.5 0 0 1-2.12-2.12l9.19-9.19"/></svg>
                            Attach Files
                          </span>
                        </label>
                        {attachments && attachments.length > 0 && (
                          <div className="attachment-list improved-attachment-list beautiful-attachment-list">
                            {attachments.map((file, idx) => {
                              const isImage = file.type.startsWith('image/');
                              let icon = null;
                              if (!isImage) {
                                if (file.type.includes('pdf')) icon = <span className="filetype-icon pdf">PDF</span>;
                                else if (file.type.includes('sheet') || file.name.match(/\.(xls|xlsx)$/i)) icon = <span className="filetype-icon sheet">SHEET</span>;
                                else if (file.type.includes('word') || file.name.match(/\.(doc|docx)$/i)) icon = <span className="filetype-icon doc">DOC</span>;
                                else icon = <span className="filetype-icon generic">FILE</span>;
                              }
                              return (
                                <div className="attachment-item improved-attachment-item beautiful-attachment-item" key={idx}>
                                  {isImage ? (
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt={file.name}
                                      className="attachment-thumb"
                                    />
                                  ) : (
                                    icon
                                  )}
                                  <span className="attachment-name improved-attachment-name">{file.name}</span>
                                  <button type="button" className="btn-remove-attachment improved-btn-remove-attachment" title="Remove" onClick={() => {
                                    setAttachments(attachments.filter((_, i) => i !== idx));
                                  }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {showCreateTemplate && (
            <>
              <div className="drawer-overlay" onClick={() => setShowCreateTemplate(false)} />
              <div className="email-drawer-fullscreen template-drawer">
                <div className="drawer-header">
                  <div className="drawer-title">
                    <h3>Create Email Template</h3>
                  </div>
                  <div className="drawer-actions">
                    <button 
                      type="button" 
                      className="btn-action-secondary"
                      onClick={() => setShowCreateTemplate(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="btn-action-primary" 
                      onClick={handleCreateTemplate}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      Save Template
                    </button>
                    <button className="btn-close-drawer" onClick={() => setShowCreateTemplate(false)} title="Close">
                      <CloseIcon />
                    </button>
                  </div>
                </div>

                <div className="drawer-body-fullscreen">
                  <div className="compose-fields-compact">
                    <div className="compose-field-row">
                      <span className="field-label">Name *</span>
                      <input
                        type="text"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                        placeholder="e.g., Follow-up Email"
                        className="field-input"
                        required
                      />
                    </div>

                    <div className="compose-field-row">
                      <span className="field-label">Subject</span>
                      <input
                        type="text"
                        value={templateForm.subject}
                        onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                        placeholder="Default subject"
                        className="field-input"
                      />
                    </div>

                    <div className="compose-field-row">
                      <span className="field-label">CC</span>
                      <input
                        type="email"
                        value={templateForm.cc}
                        onChange={(e) => setTemplateForm({ ...templateForm, cc: e.target.value })}
                        placeholder="cc@example.com"
                        className="field-input"
                      />
                    </div>

                    <div className="compose-field-row">
                      <span className="field-label">BCC</span>
                      <input
                        type="email"
                        value={templateForm.bcc}
                        onChange={(e) => setTemplateForm({ ...templateForm, bcc: e.target.value })}
                        placeholder="bcc@example.com"
                        className="field-input"
                      />
                    </div>
                  </div>
                  
                  <div className="compose-editor-fullscreen">
                    <RichTextEditor
                      value={templateForm.bodyHtml}
                      onChange={(content) => setTemplateForm({ ...templateForm, bodyHtml: content })}
                      placeholder="Type your template content here..."
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {showScheduleModal && (
            <div className="schedule-modal-overlay" onClick={() => setShowScheduleModal(false)}>
              <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
                <div className="schedule-header">
                  <h4>Schedule Email</h4>
                  <button className="btn-close" onClick={() => setShowScheduleModal(false)}>
                    <CloseIcon />
                  </button>
                </div>
                <div className="schedule-body">
                  <div className="form-group">
                    <label>Date:</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Time:</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="schedule-footer">
                  <button className="btn-cancel" onClick={() => setShowScheduleModal(false)}>
                    Cancel
                  </button>
                  <button className="btn-confirm" onClick={handleScheduleEmail}>
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default GmailTab;
