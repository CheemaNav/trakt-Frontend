import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Calendar.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Helper function to get days in month
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

// Helper function to get first day of month (0 = Sunday, 6 = Saturday)
const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to check if two dates are the same day
const isSameDay = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

// Icons
const CheckIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const InfoIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const LockIcon = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const ChevronLeftIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const PhoneIcon = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const CalendarIcon = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <path d="M16 2v4M8 2v4M3 10h18"></path>
  </svg>
);

const OutlookIcon = (props) => (
  <img 
    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAvVBMVEX///8Abs8Aa8/U5PUAb8/b6vgAZcwAY8wAYcwAaM0AXMp4ndz7/v/K3fRZltv0+P0qc8/q8/zh7vmsxepDitifxOrC3PMAV8jS6Ph9puC/1/G2zu6Wu+gAX8vJ3/SWt+aozO5qod+BruNom91Cg9UASMQAVMgwftRZktldlNq61vF9o94ifNOvxus0dNFUjNiKruOduOWGtucAOcFqj9eWwOkAT8ZwmNsggdZBetJ0q+KFuuhShtW7z+4HeNIn5oStAAAJXUlEQVR4nO2de3uiuhaHJUAuDjVCvVQU663V2s7u5Rw7U/fZfv+PdQK6IUGuI9bgk98f8zyrZCKvSVZWVgI2GkpKSkpKSkpKSkpKSkpKSkpKObJ7M+fS93AuWVR3Z6ul9mhe+k7OImcyWi2hB4Gm4WsjpPb67cnACBPN0HxdE6Glu9unNmZsvK6EkJruLRtzEBJwaLorIrToejNfaBgxOC2OV3tCxxw9vwDMPIqxpwNHgPUldHqj1rLZh3um46arMyG13Z/TpUYg8MdcBlsdCS1b3ww6f8FgzOWy1Y3QtruDVwND5MMljLdaE1rj4fQV9DHcN1zBxqsHIeuWt2+/jSD+MsqR1YDQNiez1zaAJcZcfQipfjN72hEEySlsshKa64/XL9yEJZxJbQipPXnvAM9DR7HlFRBScz2btyFks3iBSbxehBY1b0atBWB0JzkUSQnputtaELYsOAPZxQnt8f3zDmGvAm8pJaG5g5iAqtyljIT62Zvu4oTf0nyKUBEqQkWoCBWhIlSEilARKkJFqAgVoUho3pyusS0z4Y8mPFmk/UblJRzACmoC8KV4j68loaaRhXXlhBoeXTshKNyIdSXUjKIjsbaEQFeEirB6KcJyUoSK8BxCirCUFKEiTK+Y+GtQlHBQPVd1ICQIvKymH5vNx3T1AnDJoymyExoaJJ2Nbv+7aHHMbguQMt+P7IQIbo+ezKIbwyt+T1ITGpB8JCa4rK6Bio5HqQlxKzWBR7e44D1JTAi0TVYVk3Yxl7MnBO0TdQZCYoyz67grhhgQUvtE0V+gakLSzk0x28siiKiarP6PqgnBrkB+2S7y3IWkhKBYTsss4FBlJewVq+c236NKSWg0C6eW86eBRELq9kK5bMA7vM3iJz0ye+MzEJJVUcAGbWdVlEo4/k8/1MOw0Xh/4GxG/N/H0HxsW9UT4qNAzR5PNt2emZBSnzT/hFDvG6GIy3o7Ck2N2D5PaINO9YRwFuf7WLKVE0Lt1vqI0fqjNmSEYYGAkBvP0A55gstnIASxmZAFoYfixOsc3e8oZyRKSAg/xLItvh8SvI5VZXvZU4aEhIbQhFYLigRoEqtrlR3ZJJ5UuCghHAgl74+ayIh14iHObET5CLEQcK+PRxlsiXU5Sc+oS0wo7rJay+OCxmesEVuZ3VQ6Qiz4mW5SVEaexcpuM72pfIRCJ00ZYeK6Q6+WkJx7HPJ3P052IngiVEYX5QkfOaJvbsMnvtggeYSRuVjbPGsgJhN+klD+DPvejGyPEf6CoQkX1RKK033aNPAldtNR1hoqkZCO7yKxymzOvGNEJmfu/39VhEafD1mctKgai8tHt3n+N39URvjIzwSTtDv3ukJtvdJteDlCDfL9b5Z253Aq1EYzAPeEtttzD+qt/V7phgpWwCZv+yvgyHZvqiU0uEJWasR5WLOFBXd5hP88Yg8f9MBWn+tHHOqRrYDv+5zNrv9qhsWby0o9DfjN3/hr2vcAvoTarE4eoctNmX1G0EORDYfiEgz7s0X03VY8Wwjdj76k3nYsmdrKiEwPhOGINvII0VnnQ7jlCjnpt63dCdXN60NIBEKQOgnEso3PGVO+bIR8isYsTJgS+8hICK+eUOilWYTivlSNeqmQwsjwNG0xo1onT8OvGuzUiRx8iXnTGs0WRWf8hVCb9TsdUDZCIWprPKUNLyImozKjNnSIacI0/Z4wyuoHhCSy0Xmz+pAPVlIjbzGZ07Czkm1HUVszoQ3vue8SOUIbgopXwH3ehaz7Kc60ORRqy189UdMJ5e/vCLa/1ohdtx1OjSoJjT4/0TlpB4OI+DnrrBWwbDuk6J4vljK+wFLMYmxRcrmI0LmN9E5F+5YV0HmbXXc5c1gtIRAyUbNkVxNbADdSfW5IuO5HT9l9+uOQs/0uf889vecPlB84NL2Kx6EmnMG4S95XimUTncx9C1R2tsDnzggL66KEpL5/3E3spG7mcYXShGeeDzUsHPVyk3wNfBMrm2bmvKUjJK9CQJaUqumLTei0M/eepCPUgODd9YRbjh3oG2afqYHSEWIxFzrsi5cNHNs+bHSy94DlI9SW4rph8ikANlux4xhmzj6+hIT+XhCvtRZ9PGh+xM+bZG7LSEoYPxFlTo3ggD5AcOHGa0rd25CYUPOOIknno8Uc5nI7PD6SmdeEUhKCpGNtlp144LSXMwpDwugPMULjAoTxxVGG7Oy5kCM0iq+A/bhUO9sK+PC9Fn3Jxjz/DH5AyHpAeGLbfzpFsKlwDpz6n035PzTOQAhXxd6xsclaNvGEp6vqNkTT/DpYLXl+VF5CFtls8ysxCz2NEBCam26okb9PP4rsDRt3N9z1buKHVU6oedO8jqoXe0tvEHkP++hfwQfq75iGNmreNBpv0XVMEl99UT0hG4vZP7Y1znejHCHvS/0sBXcm2N8huI+ua7vEjzsDoQHbk4waukVfS38gjOrdE0YFiE/I2e3vImS1efM0L2FPiziZQoTGBQn9U8/TpIef7C2GeaFMTQgZI3ntOsLQp+6WwBJPA8tO6D8FbHS2G9N0bNsxx39Pl6Tcs4TyE/qQEGJi7NoawbD0717UgvAkKUJFWBdCjiAg5E89+4ScXVPCPhTiUv0hsvdxaWgj8F1xaaWEvKzwn2QlX6oT4Z9JEV6akJ4q65cmLeH+Da2fzRNFJCes7L0Y+e9BqDlh/FmWqyM0mkU7aV0JP38WBfx2wmdMThbEoPBuw/cTjlatkzXolnmh93cTWhWoBN4FCL9filARKkJFqAgVoSJUhIpQESpCRagIFaEiVIQ1IWzCUi9Wrx8hdUfzRZsgQrTSPwVQD0Jflql3B09tAkmwr3Mu0AsS7kXt9fvghTSRV/I3D2pDeNDdcNP6H/C80keeakMYyNbd2XypIYiIZlTVa6UiDESdm79nnR2AFXlb+QgDWbYzuZ2/AIiQ721PaU9JCQ+yesNZ6wv38QnNKTfhXo45GTztAEaw/O/o1IMwkO2sR4PFFyl9wLQ2hIEo1X+OVkuDBUOg6OisF+FBTm8yfdX6/ULNWUvCQJatj547GmbBUCZofQkDWdSZsBj+L4RT27PmhIEsarv/zF6/NAgT1irXQHgQ1W9Yc7JJRey1V0S4F5tV3n7siIfwYU12dYR7WXfd+9UCeCwYOn4y/GpkWc7Nz+kKXC/hQU6xR4qVlJSUlJSUlJSUlJSUlJSUrl//BxW+HlSDk180AAAAAElFTkSuQmCC" 
    alt="Outlook" 
    width="20" 
    height="20"
    style={{ ...props.style }}
  />
);

function Calendar() {
  // Connection state - now supports multiple providers
  const [status, setStatus] = useState({
    google: null,
    outlook: null,
    connected: false
  });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connectingProvider, setConnectingProvider] = useState(null);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]); // Normalized events from all sources
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Filter state
  const [selectedUser, setSelectedUser] = useState(null); // Will be set to logged-in user by default
  const [users, setUsers] = useState([]);
  // Category options:
  // - 'meetings': Calendar events (from Google Calendar or Outlook)
  // - 'calls': Backend CRM calls
  // - 'tasks': Future implementation
  // - 'events': Future implementation (company events, separate from Calendar meetings)
  const [selectedCategory, setSelectedCategory] = useState('meetings'); // Single selection
  // Calendar provider: 'all', 'google', or 'outlook'
  const [selectedProvider, setSelectedProvider] = useState('all');

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [leadDetails, setLeadDetails] = useState(null);
  const [loadingLeadDetails, setLoadingLeadDetails] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    attendees: '',
    timezone: 'UTC',
    reminderMinutes: 15,
    leadId: null,
    leadName: '',
    provider: 'google'
  });
  const [attendeeEmails, setAttendeeEmails] = useState([]);
  const [currentEmail, setCurrentEmail] = useState('');

  // Helper functions
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailInput = (e) => {
    const value = e.target.value;
    setCurrentEmail(value);
    
    if (value.endsWith(',') || value.endsWith(' ')) {
      const email = value.slice(0, -1).trim();
      if (email && validateEmail(email)) {
        setAttendeeEmails([...attendeeEmails, email]);
        setCurrentEmail('');
      } else if (email) {
        toast.error('Invalid email format');
      }
    }
  };

  const removeEmail = (indexToRemove) => {
    setAttendeeEmails(attendeeEmails.filter((_, index) => index !== indexToRemove));
  };

  // Handle event click
  const handleEventClick = async (event) => {
    setSelectedEvent(event);
    setShowEventDetailModal(true);
    setLeadDetails(null);
    
    // If this is a call event, fetch the lead details
    if (event.category === 'calls' && event.leadId) {
      setLoadingLeadDetails(true);
      try {
        const token = localStorage.getItem('token');
        
        // Fetch lead details
        const leadResponse = await fetch(`${API_URL}/leads/${event.leadId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (leadResponse.ok) {
          const leadData = await leadResponse.json();
          const lead = leadData.lead || leadData;
          
          // Fetch calls for this lead
          const callsResponse = await fetch(`${API_URL}/leads/${event.leadId}/calls`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          let calls = [];
          if (callsResponse.ok) {
            const callsData = await callsResponse.json();
            calls = callsData.calls || [];
          }
          
          setLeadDetails({
            ...lead,
            calls: calls
          });
        }
      } catch (error) {
        console.error('Error fetching lead details:', error);
      } finally {
        setLoadingLeadDetails(false);
      }
    }
  };

  // Initialize
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      setSelectedUser(user.id);
    }
    
    // Check if we're being opened from a lead page with URL params
    const params = new URLSearchParams(window.location.search);
    const leadId = params.get('leadId');
    const leadName = params.get('leadName');
    
    if (leadId && leadName) {
      setFormData(prev => ({
        ...prev,
        leadId: parseInt(leadId),
        leadName: decodeURIComponent(leadName)
      }));
      // Open create modal automatically
      setShowCreateModal(true);
    }
    
    checkStatus();
    fetchUsers();
  }, []);

  // Fetch events when month changes or filters change
  useEffect(() => {
    if (status.connected && selectedUser) {
      fetchAllCalendarData();
    }
  }, [currentDate, selectedUser, selectedCategory, selectedProvider, status.connected]);

  // Fetch users for the dropdown
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
        console.log('Fetched users:', data.users);
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users:', response.status);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch all calendar data (meetings + calls)
  const fetchAllCalendarData = async () => {
    setLoadingEvents(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      // Get first and last day of the month
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);
      
      console.log('Fetching calendar data for:', { 
        selectedCategory, 
        selectedProvider,
        categoryDescription: selectedCategory === 'meetings' ? 'Calendar Events' : 
                           selectedCategory === 'calls' ? 'CRM Calls' : 
                           selectedCategory === 'tasks' ? 'Tasks (Not Implemented)' : 
                           'Company Events (Not Implemented)',
        month: currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      const allEvents = [];

      // Fetch data based on selected category
      if (selectedCategory === 'meetings' && status.connected) {
        console.log(`Fetching meetings from ${selectedProvider === 'all' ? 'all connected calendars' : selectedProvider}...`);
        const meetings = await fetchCalendarEvents(startDate, endDate, selectedProvider);
        console.log('Fetched meetings:', meetings.length);
        allEvents.push(...meetings);
      } else if (selectedCategory === 'calls') {
        console.log('Fetching calls from backend...');
        const calls = await fetchCalls(startDate, endDate);
        console.log('Fetched calls:', calls.length);
        allEvents.push(...calls);
      }
      // Tasks and Events will be implemented later

      // Sort events by date/time
      allEvents.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
      
      console.log('Total events after sorting:', allEvents.length);
      setCalendarEvents(allEvents);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      toast.error('Failed to fetch calendar data');
    } finally {
      setLoadingEvents(false);
    }
  };

  // Fetch calendar events (Google or Outlook)
  const fetchCalendarEvents = async (startDate, endDate, provider = 'all') => {
    try {
      const token = localStorage.getItem('token');
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const params = new URLSearchParams({
        filter: 'range',
        startDate: startDateStr,
        endDate: endDateStr
      });
      
      if (provider !== 'all') {
        params.append('provider', provider);
      }
      
      const response = await fetch(
        `${API_URL}/calendar/events?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const events = data.events || [];
        
        console.log('Calendar API response:', events.length, 'events');
        
        // Normalize calendar events from both Google and Outlook
        return events.map(event => {
          // Extract reminder minutes
          let reminderMinutes = event.reminderMinutes || null;
          
          // Extract lead info from extended properties if it exists (Google Calendar)
          const leadId = event.leadId || null;
          const leadName = event.leadName || null;
          
          return {
            id: event.id,
            title: event.title || 'Untitled Event',
            description: event.description || '',
            startDateTime: event.startDateTime,
            endDateTime: event.endDateTime,
            isAllDay: event.isAllDay,
            category: 'meetings',
            attendees: event.attendees || [],
            location: event.location || '',
            conferenceData: event.conferenceData,
            reminderMinutes: reminderMinutes,
            leadId: leadId ? parseInt(leadId) : null,
            leadName: leadName,
            provider: event.provider,
            source: event.provider === 'google' ? 'google' : 'outlook'
          };
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch calendar events:', response.status, errorData);
        
        // If refresh token error, prompt user to reconnect
        if (errorData.error && errorData.error.includes('refresh token')) {
          toast.error(
            'Calendar connection needs to be refreshed. Please disconnect and reconnect your calendar.',
            { autoClose: 8000 }
          );
          setStatus({ google: null, outlook: null, connected: false });
        } else {
          toast.error('Failed to fetch calendar events');
        }
        return [];
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  };

  // Fetch calls from backend
  const fetchCalls = async (startDate, endDate) => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all leads to get their calls
      const leadsResponse = await fetch(`${API_URL}/leads`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!leadsResponse.ok) return [];
      
      const leadsData = await leadsResponse.json();
      const leads = leadsData.leads || [];
      
      const allCalls = [];
      
      // Fetch calls for each lead
      for (const lead of leads) {
        const callsResponse = await fetch(`${API_URL}/leads/${lead.id}/calls`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (callsResponse.ok) {
          const callsData = await callsResponse.json();
          const calls = callsData.calls || [];
          
          // Normalize calls data and filter by date range
          calls.forEach(call => {
            if (call.call_date) {
              const callDateTime = new Date(`${call.call_date}T${call.call_time || '00:00:00'}`);
              
              if (callDateTime >= startDate && callDateTime <= endDate) {
                allCalls.push({
                  id: `call-${call.id}`,
                  title: call.subject || 'Call',
                  description: call.description || call.notes || '',
                  startDateTime: callDateTime.toISOString(),
                  endDateTime: new Date(callDateTime.getTime() + (call.duration || 30) * 60000).toISOString(),
                  isAllDay: false,
                  category: 'calls',
                  leadId: lead.id,
                  leadName: lead.name || lead.title,
                  duration: call.duration,
                  callType: call.call_type,
                  status: call.status,
                  source: 'backend'
                });
              }
            }
          });
        }
      }
      
      return allCalls;
    } catch (error) {
      console.error('Error fetching calls:', error);
      return [];
    }
  };

  // Handle OAuth redirect callback on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get('connected');
    const error = urlParams.get('error');

    if (connected === 'true') {
      toast.success('Google Calendar connected successfully!');
      checkStatus();
      fetchAllCalendarData();
      window.history.replaceState({}, '', '/calendar');
    } else if (error) {
      toast.error(`Failed to connect Google Calendar: ${error}`);
      window.history.replaceState({}, '', '/calendar');
    }
  }, []);

  // OAuth connect function - handles both Google and Outlook
  const handleOAuthConnect = async (provider = 'google') => {
    setConnecting(true);
    setConnectingProvider(provider);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/calendar/oauth/url?provider=${provider}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        toast.error(`Failed to initiate ${provider} OAuth flow`);
        setConnecting(false);
        setConnectingProvider(null);
      }
    } catch (error) {
      console.error(`Error starting ${provider} OAuth:`, error);
      toast.error(`Failed to connect ${provider} calendar`);
      setConnecting(false);
      setConnectingProvider(null);
    }
  };

  const handleAuthCallback = async (response) => {
    // This function is now deprecated - OAuth happens via redirect
    try {
      const token = localStorage.getItem('token');
      
      const connectResponse = await fetch(`${API_URL}/calendar/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_token: response.access_token,
          refresh_token: response.refresh_token || null,
          expiry_date: response.expires_in ? Date.now() + (response.expires_in * 1000) : null,
          token_type: response.token_type || 'Bearer'
        })
      });

      if (connectResponse.ok) {
        setStatus({ connected: true });
        toast.success('Google Calendar connected successfully!');
        checkStatus();
      } else {
        const error = await connectResponse.json();
        toast.error('Failed to connect Calendar: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error connecting Calendar:', error);
      toast.error('Failed to connect Calendar');
    } finally {
      setConnecting(false);
    }
  };

  const checkStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/calendar/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Error checking Calendar status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Event creation
  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate that end time is after start time
    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);
    
    if (endDate <= startDate) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const attendeesArray = attendeeEmails;

      const response = await fetch(`${API_URL}/calendar/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          startTime: formData.startTime,
          endTime: formData.endTime,
          attendees: attendeesArray,
          timezone: formData.timezone,
          reminderMinutes: parseInt(formData.reminderMinutes),
          leadId: formData.leadId,
          leadName: formData.leadName,
          provider: formData.provider || 'google'
        })
      });

      if (response.ok) {
        toast.success('Event created successfully!');
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          startTime: '',
          endTime: '',
          attendees: '',
          timezone: 'UTC',
          reminderMinutes: 15,
          leadId: null,
          leadName: '',
          provider: 'google'
        });
        setAttendeeEmails([]);
        setCurrentEmail('');
        fetchAllCalendarData(); // Refresh calendar data
      } else {
        const error = await response.json();
        toast.error('Failed to create event: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const handleDisconnect = async (provider = 'google') => {
    if (!window.confirm(`Are you sure you want to disconnect ${provider.charAt(0).toUpperCase() + provider.slice(1)} Calendar?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/calendar/disconnect?provider=${provider}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        checkStatus();
        setCalendarEvents([]);
        toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} Calendar disconnected successfully`);
      }
    } catch (error) {
      console.error(`Error disconnecting ${provider} Calendar:`, error);
      toast.error(`Failed to disconnect ${provider} Calendar`);
    }
  };

  // Helper functions for calendar rendering
  const getEventsForDate = (date) => {
    const events = calendarEvents.filter(event => {
      const eventDate = new Date(event.startDateTime);
      return isSameDay(eventDate, date);
    });
    if (events.length > 0) {
      console.log(`Events for ${date.toDateString()}:`, events);
    }
    return events;
  };

  const getCategoryColor = (category) => {
    const colors = {
      meetings: '#4285f4',
      calls: '#34a853',
      tasks: '#fbbc05',
      events: '#ea4335'
    };
    return colors[category] || '#9ca3af';
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'meetings':
        return <CalendarIcon />;
      case 'calls':
        return <PhoneIcon />;
      default:
        return null;
    }
  };

  const formatEventTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getJoinUrl = (event) => {
    // Check for Google Meet URL in conferenceData
    if (event.conferenceData?.entryPoints) {
      const meetEntry = event.conferenceData.entryPoints.find(entry => entry.entryPointType === 'video');
      if (meetEntry?.uri) return meetEntry.uri;
    }
    
    // Check description for common meet URLs
    if (event.description) {
      const meetMatch = event.description.match(/(https:\/\/meet\.google\.com\/\S+)/);
      if (meetMatch) return meetMatch[1];
      
      const zoomMatch = event.description.match(/(https:\/\/zoom\.us\/\S+)/);
      if (zoomMatch) return zoomMatch[1];
    }
    
    // Check event location for URLs
    if (event.location) {
      if (event.location.includes('http')) return event.location;
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="calendar-connect-loading premium-card">
        <div className="premium-loader-container">
          <div className="premium-loader"></div>
          <div className="loader-text">Checking connection...</div>
        </div>
      </div>
    );
  }

  if (!status?.connected) {
    return (
      <div className="calendar-connect premium-card">
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
                <span style={{ fontSize: '2em' }}>📅</span>
              </div>
            </div>
            <div className="header-text">
              <h3 className="service-title">Calendar Integration</h3>
              <p className="service-subtitle">Connect Google Calendar or Outlook</p>
            </div>
          </div>
        </div>

        <div className="setup-state premium-section">
          <div className="info-card">
            <div className="info-icon-wrapper">
              <InfoIcon />
            </div>
            <div className="info-content">
              <h4>Connect Your Calendar</h4>
              <p>Sync your calendar to view, create, and manage all your meetings in one place</p>
            </div>
          </div>
          
          <div className="benefits-list">
            <div className="benefit-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>View meetings from today, upcoming, and past</span>
            </div>
            <div className="benefit-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Create and manage events directly from CRM</span>
            </div>
            <div className="benefit-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Set reminders and invite attendees</span>
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
              className="connect-btn premium-btn google-btn" 
              onClick={() => handleOAuthConnect('google')} 
              disabled={connecting && connectingProvider === 'google'}
            >
              {connecting && connectingProvider === 'google' ? (
                <span className="btn-loader"></span>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google Calendar
                </>
              )}
            </button>
            
            <button 
              className="connect-btn premium-btn outlook-btn" 
              onClick={() => handleOAuthConnect('outlook')} 
              disabled={connecting && connectingProvider === 'outlook'}
              style={{ backgroundColor: '#0078d4', marginTop: '10px' }}
            >
              {connecting && connectingProvider === 'outlook' ? (
                <span className="btn-loader"></span>
              ) : (
                <>
                  <OutlookIcon style={{ marginRight: '8px' }} />
                  Outlook Calendar
                </>
              )}
            </button>

            <p className="security-note" style={{ marginTop: '15px' }}>
              <LockIcon />
              Your data is secured with OAuth 2.0
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="calendar-view-container">
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

      {/* Left Sidebar - Filters */}
      <div className="calendar-sidebar">
        <div className="sidebar-section">
          <h3 className="sidebar-title">Filter Calendar</h3>
          
          {/* Calendar Provider Selector */}
          <div className="filter-group">
            <label className="filter-label">Calendar Provider:</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
              <button
                onClick={() => setSelectedProvider('all')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: selectedProvider === 'all' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                  backgroundColor: selectedProvider === 'all' ? '#eff6ff' : '#fff',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: selectedProvider === 'all' ? '600' : '500'
                }}
              >
                All
              </button>
              {status.google && (
                <button
                  onClick={() => setSelectedProvider('google')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: selectedProvider === 'google' ? '2px solid #4285f4' : '2px solid #e5e7eb',
                    backgroundColor: selectedProvider === 'google' ? '#eff6ff' : '#fff',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: selectedProvider === 'google' ? '600' : '500'
                  }}
                  title="Google Calendar"
                >
                  Google
                </button>
              )}
              {status.outlook && (
                <button
                  onClick={() => setSelectedProvider('outlook')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: selectedProvider === 'outlook' ? '2px solid #0078d4' : '2px solid #e5e7eb',
                    backgroundColor: selectedProvider === 'outlook' ? '#ecf4ff' : '#fff',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: selectedProvider === 'outlook' ? '600' : '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  title="Outlook Calendar"
                >
                  <OutlookIcon style={{ width: '14px', height: '14px' }} />
                  Outlook
                </button>
              )}
            </div>
          </div>
          
          {/* User Selector */}
          <div className="filter-group">
            <label className="filter-label">View Calendar For:</label>
            <select 
              className="user-select"
              value={selectedUser || ''}
              onChange={(e) => setSelectedUser(parseInt(e.target.value))}
            >
              {users.length === 0 ? (
                <option value="">Loading users...</option>
              ) : (
                users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Category Badges */}
          <div className="filter-group">
            <label className="filter-label">Select Category:</label>
            <div className="category-badges">
              <button
                className={`category-badge ${selectedCategory === 'meetings' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('meetings')}
                style={{ '--badge-color': '#4285f4' }}
                title="All Google Calendar events and meetings"
              >
                <CalendarIcon />
                <span>Meetings</span>
              </button>

              <button
                className={`category-badge ${selectedCategory === 'calls' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('calls')}
                style={{ '--badge-color': '#34a853' }}
              >
                <PhoneIcon />
                <span>Calls</span>
              </button>

              <button
                className="category-badge disabled"
                disabled
                style={{ '--badge-color': '#fbbc05' }}
                title="Coming soon"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 11 12 14 22 4"></polyline>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <span>Tasks</span>
                <LockIcon style={{ width: 12, height: 12, opacity: 0.5 }} />
              </button>

              <button
                className="category-badge disabled"
                disabled
                style={{ '--badge-color': '#ea4335' }}
                title="Company events (not yet implemented - separate from Google Calendar meetings)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                  <line x1="6" y1="1" x2="6" y2="4"></line>
                  <line x1="10" y1="1" x2="10" y2="4"></line>
                  <line x1="14" y1="1" x2="14" y2="4"></line>
                </svg>
                <span>Events</span>
                <LockIcon style={{ width: 12, height: 12, opacity: 0.5 }} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="filter-group">
            <button className="sidebar-btn-primary" onClick={() => setShowCreateModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>New Event</span>
            </button>
            
            {/* Disconnect buttons for each provider */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              {status.google && (
                <button 
                  className="sidebar-btn-secondary" 
                  onClick={() => handleDisconnect('google')}
                  style={{ flex: 1, fontSize: '12px' }}
                  title="Disconnect Google Calendar"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Google</span>
                </button>
              )}
              
              {status.outlook && (
                <button 
                  className="sidebar-btn-secondary" 
                  onClick={() => handleDisconnect('outlook')}
                  style={{ flex: 1, fontSize: '12px' }}
                  title="Disconnect Outlook Calendar"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Outlook</span>
                </button>
              )}
            </div>
            
            {/* Connect Additional Calendar Button */}
            {(!status.google || !status.outlook) && (
              <div className="filter-group" style={{ marginTop: '10px' }}>
                <label className="filter-label">Add Calendar:</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!status.google && (
                    <button 
                      className="sidebar-btn-primary" 
                      onClick={() => handleOAuthConnect('google')}
                      style={{ flex: 1, fontSize: '12px', backgroundColor: '#4285f4' }}
                      disabled={connecting && connectingProvider === 'google'}
                    >
                      {connecting && connectingProvider === 'google' ? '...' : 'Google'}
                    </button>
                  )}
                  {!status.outlook && (
                    <button 
                      className="sidebar-btn-primary" 
                      onClick={() => handleOAuthConnect('outlook')}
                      style={{ flex: 1, fontSize: '12px', backgroundColor: '#0078d4' }}
                      disabled={connecting && connectingProvider === 'outlook'}
                    >
                      {connecting && connectingProvider === 'outlook' ? '...' : 'Outlook'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="calendar-main">
        {/* Header with Navigation */}
        <div className="calendar-header">
          <div className="header-center">
            <button className="nav-btn" onClick={goToPreviousMonth}>
              <ChevronLeftIcon />
            </button>
            <h3 className="current-month">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button className="nav-btn" onClick={goToNextMonth}>
              <ChevronRightIcon />
            </button>
            <button className="today-btn" onClick={goToToday}>
              Today
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid-container">
          {loadingEvents && (
            <div className="calendar-loading-overlay">
              <div className="spinner"></div>
              <p>Loading events...</p>
            </div>
          )}

          {/* Week days header */}
          <div className="calendar-weekdays">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="weekday-header">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days grid */}
          <div className="calendar-days-grid">
            {(() => {
              const year = currentDate.getFullYear();
              const month = currentDate.getMonth();
              const firstDay = getFirstDayOfMonth(year, month);
              const daysInMonth = getDaysInMonth(year, month);
              const today = new Date();
              
              const days = [];
              
              console.log('Rendering calendar with', calendarEvents.length, 'total events');
              
              // Empty cells for days before month starts
              for (let i = 0; i < firstDay; i++) {
                days.push(
                  <div key={`empty-${i}`} className="calendar-day empty"></div>
                );
              }
              
              // Days of the month
              for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const isToday = isSameDay(date, today);
                const dayEvents = getEventsForDate(date);
                const visibleEvents = dayEvents.slice(0, 3);
                const hasMore = dayEvents.length > 3;
                
                days.push(
                  <div 
                    key={day} 
                    className={`calendar-day ${isToday ? 'today' : ''}`}
                  >
                    <div className="day-number">{day}</div>
                    <div className="day-events">
                      {dayEvents.length > 0 && console.log(`Rendering ${dayEvents.length} events for day ${day}`)}
                      {visibleEvents.map((event, idx) => (
                        <div 
                          key={idx}
                          className="day-event"
                          style={{ borderLeft: `3px solid ${getCategoryColor(event.category)}` }}
                          title={`${event.title} - ${formatEventTime(event.startDateTime)}`}
                          onClick={() => handleEventClick(event)}
                        >
                          {getCategoryIcon(event.category)}
                          <span className="event-time">{formatEventTime(event.startDateTime)}</span>
                          <span className="event-title">{event.title}</span>
                        </div>
                      ))}
                      {hasMore && (
                        <div className="more-events">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              
              return days;
            })()}
          </div>
        </div>
      </div>
      </div>

      {/* Create Event Modal - Modern Redesign */}
      {showCreateModal && ReactDOM.createPortal(
        <div className="create-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="create-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Gradient Header */}
            <div className="create-modal-header">
              <div className="create-header-content">
                <div className="create-icon">✨</div>
                <div className="create-header-text">
                  <h2>Create New Event</h2>
                  <p>Schedule a meeting or event on your calendar</p>
                </div>
              </div>
              <button className="create-close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateEvent} className="create-modal-body">
              {/* Lead Banner */}
              {formData.leadName && (
                <div className="create-lead-banner">
                  <div className="create-lead-icon">👤</div>
                  <div className="create-lead-info">
                    <div className="create-lead-label">Event for</div>
                    <div className="create-lead-name">{formData.leadName}</div>
                  </div>
                </div>
              )}
              
              {/* Calendar Provider Selection */}
              {status.google && status.outlook && (
                <div className="create-form-field">
                  <label className="create-label">
                    <span className="label-icon">📅</span>
                    Calendar
                  </label>
                  <select
                    value={formData.provider || 'google'}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="create-select"
                  >
                    <option value="google">Google Calendar</option>
                    <option value="outlook">Outlook Calendar</option>
                  </select>
                </div>
              )}
              
              {/* Event Title */}
              <div className="create-form-field">
                <label className="create-label">
                  <span className="label-icon">📋</span>
                  Event Title
                </label>
                <input
                  type="text"
                  className="create-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Team meeting, Client call..."
                  required
                />
              </div>

              {/* Date & Time Row */}
              <div className="create-time-row">
                <div className="create-form-field">
                  <label className="create-label">
                    <span className="label-icon">🕐</span>
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    className="create-input"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>

                <div className="create-form-field">
                  <label className="create-label">
                    <span className="label-icon">🕐</span>
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    className="create-input"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="create-form-field">
                <label className="create-label">
                  <span className="label-icon">📝</span>
                  Description
                </label>
                <textarea
                  className="create-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add meeting agenda, notes, or details..."
                  rows="3"
                />
              </div>

              {/* Attendees */}
              <div className="create-form-field">
                <label className="create-label">
                  <span className="label-icon">👥</span>
                  Attendees
                  <span className="label-hint">Type email and press comma or space</span>
                </label>
                <div className="create-email-container">
                  {attendeeEmails.length > 0 && (
                    <div className="create-email-tags">
                      {attendeeEmails.map((email, index) => (
                        <span key={index} className="create-email-tag">
                          {email}
                          <button type="button" className="tag-remove" onClick={() => removeEmail(index)}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    className="create-email-input"
                    value={currentEmail}
                    onChange={handleEmailInput}
                    placeholder={attendeeEmails.length === 0 ? "colleague@company.com" : "Add another..."}
                  />
                </div>
              </div>

              {/* Reminder */}
              <div className="create-form-field">
                <label className="create-label">
                  <span className="label-icon">🔔</span>
                  Reminder
                </label>
                <select
                  value={formData.reminderMinutes}
                  onChange={(e) => setFormData({ ...formData, reminderMinutes: parseInt(e.target.value) })}
                  className="create-select"
                >
                  <option value={5}>5 minutes before</option>
                  <option value={10}>10 minutes before</option>
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                  <option value={60}>1 hour before</option>
                  <option value={1440}>1 day before</option>
                  <option value={10080}>1 week before</option>
                </select>
              </div>

              {/* Footer Actions */}
              <div className="create-modal-footer">
                <button type="button" className="create-btn-cancel" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="create-btn-submit">
                  <span className="btn-icon">✓</span>
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Event Detail Modal - Modern Redesign */}
      {showEventDetailModal && selectedEvent && ReactDOM.createPortal(
        <div className="event-modal-overlay" onClick={() => setShowEventDetailModal(false)}>
          <div className="event-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Gradient Header */}
            <div className="event-modal-header">
              <div className="event-header-content">
                <div className="event-category-icon">
                  {getCategoryIcon(selectedEvent.category)}
                </div>
                <div className="event-header-text">
                  <h2>{selectedEvent.title}</h2>
                  <div className="event-source-badge">
                    {selectedEvent.source === 'google' ? '🗓️ Google Calendar' : '📞 CRM'}
                  </div>
                </div>
              </div>
              <button className="event-close-btn" onClick={() => setShowEventDetailModal(false)}>×</button>
            </div>

            {/* Compact Content */}
            <div className="event-modal-body">
              {/* Time Card */}
              <div className="event-info-card">
                <div className="info-icon">⏰</div>
                <div className="info-content">
                  {selectedEvent.isAllDay ? (
                    <div className="info-text">All Day • {new Date(selectedEvent.startDateTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                  ) : (
                    <>
                      <div className="info-text">{new Date(selectedEvent.startDateTime).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
                      <div className="info-subtext">Until {new Date(selectedEvent.endDateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedEvent.description && (
                <div className="event-info-card">
                  <div className="info-icon">📝</div>
                  <div className="info-content">
                    <div className="info-text">{selectedEvent.description}</div>
                  </div>
                </div>
              )}

              {/* Meeting Details */}
              {selectedEvent.category === 'meetings' && (
                <>
                  {selectedEvent.location && (
                    <div className="event-info-card">
                      <div className="info-icon">📍</div>
                      <div className="info-content">
                        <div className="info-text">{selectedEvent.location}</div>
                      </div>
                    </div>
                  )}

                  {getJoinUrl(selectedEvent) && (
                    <a href={getJoinUrl(selectedEvent)} target="_blank" rel="noopener noreferrer" className="event-action-card">
                      <div className="info-icon">🎥</div>
                      <div className="info-content">
                        <div className="info-text">Join Video Meeting</div>
                      </div>
                      <div className="action-arrow">→</div>
                    </a>
                  )}

                  {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                    <div className="event-info-card">
                      <div className="info-icon">👥</div>
                      <div className="info-content">
                        <div className="info-text">{selectedEvent.attendees.length} {selectedEvent.attendees.length === 1 ? 'Attendee' : 'Attendees'}</div>
                        <div className="attendee-list">
                          {selectedEvent.attendees.slice(0, 3).map((att, i) => (
                            <span key={i} className="attendee-tag">{att.email}</span>
                          ))}
                          {selectedEvent.attendees.length > 3 && (
                            <span className="attendee-tag">+{selectedEvent.attendees.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedEvent.reminderMinutes && (
                    <div className="event-info-card">
                      <div className="info-icon">🔔</div>
                      <div className="info-content">
                        <div className="info-text">
                          {selectedEvent.reminderMinutes >= 10080 ? `${selectedEvent.reminderMinutes / 10080} week before` :
                           selectedEvent.reminderMinutes >= 1440 ? `${selectedEvent.reminderMinutes / 1440} day before` :
                           selectedEvent.reminderMinutes >= 60 ? `${selectedEvent.reminderMinutes / 60} hour before` :
                           `${selectedEvent.reminderMinutes} minutes before`}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lead Info for meetings created from leads */}
                  {selectedEvent.leadName && (
                    <div className="event-info-card lead-highlight">
                      <div className="info-icon">👤</div>
                      <div className="info-content">
                        <div className="info-label">Lead</div>
                        <div className="info-text">{selectedEvent.leadName}</div>
                      </div>
                      {selectedEvent.leadId && (
                        <a href={`/leads/${selectedEvent.leadId}`} className="view-link">View →</a>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Call Details with Lead */}
              {selectedEvent.category === 'calls' && (
                <>
                  {loadingLeadDetails ? (
                    <div className="event-loading">
                      <div className="spinner-small"></div>
                      <span>Loading lead details...</span>
                    </div>
                  ) : leadDetails ? (
                    <>
                      {/* Lead Card */}
                      <div className="lead-card-compact">
                        <div className="lead-avatar">{leadDetails.name.charAt(0).toUpperCase()}</div>
                        <div className="lead-info">
                          <div className="lead-name">{leadDetails.name}</div>
                          <div className="lead-meta">
                            {leadDetails.email && <span>✉️ {leadDetails.email}</span>}
                            {leadDetails.phone && <span>📱 {leadDetails.phone}</span>}
                          </div>
                          {leadDetails.company && <div className="lead-company">🏢 {leadDetails.company}</div>}
                        </div>
                        {selectedEvent.leadId && (
                          <a href={`/leads/${selectedEvent.leadId}`} className="lead-view-btn">View Profile →</a>
                        )}
                      </div>

                      {/* Call Stats */}
                      <div className="call-stats-row">
                        {selectedEvent.callType && (
                          <div className="stat-item">
                            <div className="stat-label">Type</div>
                            <div className="stat-value">{selectedEvent.callType.charAt(0).toUpperCase() + selectedEvent.callType.slice(1)}</div>
                          </div>
                        )}
                        {selectedEvent.duration && (
                          <div className="stat-item">
                            <div className="stat-label">Duration</div>
                            <div className="stat-value">{selectedEvent.duration}m</div>
                          </div>
                        )}
                        {selectedEvent.status && (
                          <div className="stat-item">
                            <div className="stat-label">Status</div>
                            <div className={`stat-value status-${selectedEvent.status}`}>
                              {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Scheduled Activities */}
                      {leadDetails.calls && leadDetails.calls.length > 0 && (
                        <div className="activities-section">
                          <div className="activities-header">
                            <span className="activities-title">📅 Scheduled Activities</span>
                            <span className="activities-count">{leadDetails.calls.length}</span>
                          </div>
                          <div className="activities-list">
                            {leadDetails.calls.slice(0, 4).map((call, i) => (
                              <div key={i} className="activity-item">
                                <div className="activity-dot"></div>
                                <div className="activity-content">
                                  <div className="activity-title">{call.call_type || 'Call'}</div>
                                  <div className="activity-time">{new Date(call.scheduled_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
                                </div>
                                {call.status && (
                                  <span className={`activity-status ${call.status}`}>
                                    {call.status === 'completed' ? '✓' : '⏱️'}
                                  </span>
                                )}
                              </div>
                            ))}
                            {leadDetails.calls.length > 4 && (
                              <div className="activity-more">+{leadDetails.calls.length - 4} more</div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : selectedEvent.leadName ? (
                    <div className="event-info-card">
                      <div className="info-icon">👤</div>
                      <div className="info-content">
                        <div className="info-label">Lead</div>
                        <div className="info-text">{selectedEvent.leadName}</div>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="event-modal-footer">
              <button className="btn-modal-close" onClick={() => setShowEventDetailModal(false)}>Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default Calendar;

