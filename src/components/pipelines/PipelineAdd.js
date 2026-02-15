import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './PipelineAdd.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const TrashIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 7h14" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
    <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
  </svg>
);

const GripIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="19" r="1" />
  </svg>
);

function PipelineAdd() {
  const navigate = useNavigate();
  const [pipelineName, setPipelineName] = useState('New Pipeline');
  const [currency, setCurrency] = useState('USD');
  const [stages, setStages] = useState([
    { id: 'temp-1', name: 'Contacted', probability: 20, color: '#fbbc04', isNew: true },
    { id: 'temp-2', name: 'Not Contacted', probability: 10, color: '#1a73e8', isNew: true },
    { id: 'temp-3', name: 'Closed', probability: 100, color: '#34a853', isNew: true },
    { id: 'temp-4', name: 'Lost', probability: 0, color: '#ea4335', isNew: true }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAddStage = () => {
    const newStage = {
      id: `temp-${Date.now()}`,
      name: 'New Stage',
      probability: 0,
      color: '#1a73e8',
      isNew: true
    };
    setStages([...stages, newStage]);
  };

  const handleDeleteStage = (stageId) => {
    setStages(stages.filter(stage => stage.id !== stageId));
  };

  const handleStageChange = (stageId, field, value) => {
    setStages(stages.map(stage => {
      if (stage.id === stageId) {
        return { ...stage, [field]: value };
      }
      return stage;
    }));
  };

  const handleSave = async () => {
    if (!pipelineName.trim()) {
      setError('Pipeline name is required');
      return;
    }

    if (stages.length === 0) {
      setError('At least one stage is required');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const stagesData = stages.map((stage, index) => ({
        name: stage.name,
        probability: parseFloat(stage.probability) || 0,
        color: stage.color,
        display_order: index
      }));

      const response = await fetch(`${API_URL}/pipelines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: pipelineName.trim(),
          currency,
          stages: stagesData
        })
      });

      if (response.ok) {
        await response.json();
        // Navigate back to leads, the pipeline will be auto-selected
        navigate('/leads');
      } else {
        let errorMessage = 'Failed to create pipeline. Please try again.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          if (response.status === 404) {
            errorMessage = 'Pipeline API endpoint not found. Please restart the backend server:\n1. Stop the backend server (Ctrl+C)\n2. Run: cd backend && npm start';
          } else {
            errorMessage = `Error ${response.status}: ${response.statusText || errorMessage}`;
          }
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error creating pipeline:', error);
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setError('Cannot connect to backend server. Please ensure the backend is running on http://localhost:5001');
      } else {
        setError(`Failed to create pipeline: ${error.message || 'Please try again.'}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/leads');
  };

  return (
    <div className="pipeline-add-container">
      <div className="pipeline-add-header">
        <div className="pipeline-add-header-left">
          <input
            type="text"
            className="pipeline-name-input"
            value={pipelineName}
            onChange={(e) => setPipelineName(e.target.value)}
            placeholder="New Pipeline"
          />
          <div className="pipeline-currency-section">
            <label className="pipeline-currency-label">Pipeline Currency</label>
            <select
              className="pipeline-currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">Use account currency (USD)</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>
        </div>
        <div className="pipeline-add-header-right">
          <button className="btn-new-stage" onClick={handleAddStage}>
            + New Stage
          </button>
          <button className="btn-save" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button className="btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>

      {error && (
        <div className="pipeline-error">
          {error}
        </div>
      )}

      <div className="pipeline-stages-grid">
        {stages.map((stage, index) => (
          <div key={stage.id} className="stage-card">
            <div className="stage-card-header">
              <div className="stage-card-title">
                <span className="stage-probability-icon">⚖</span>
                <span className="stage-probability-value">{stage.probability}%</span>
              </div>
              <div className="stage-card-actions">
                <button
                  className="stage-action-btn stage-delete-btn"
                  onClick={() => handleDeleteStage(stage.id)}
                  aria-label="Delete stage"
                >
                  <TrashIcon />
                </button>
                <button
                  className="stage-action-btn stage-grip-btn"
                  aria-label="Reorder stage"
                >
                  <GripIcon />
                </button>
              </div>
            </div>
            <div className="stage-card-body">
              <div className="stage-field">
                <label>Name</label>
                <input
                  type="text"
                  value={stage.name}
                  onChange={(e) => handleStageChange(stage.id, 'name', e.target.value)}
                  placeholder="Stage name"
                />
              </div>
              <div className="stage-field">
                <label>Probability</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={stage.probability}
                  onChange={(e) => handleStageChange(stage.id, 'probability', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PipelineAdd;

