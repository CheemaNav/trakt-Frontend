import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

function PipelineEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pipelineName, setPipelineName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [stages, setStages] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPipeline = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/pipelines/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.pipeline) {
            setPipelineName(data.pipeline.name || '');
            setCurrency(data.pipeline.currency || 'USD');
            if (data.pipeline.stages && data.pipeline.stages.length > 0) {
              const formattedStages = data.pipeline.stages.map(stage => ({
                id: stage.id,
                name: stage.name,
                probability: stage.probability || 0,
                color: stage.color || '#1a73e8',
                isNew: false
              }));
              setStages(formattedStages);
            }
          }
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load pipeline');
        }
      } catch (error) {
        console.error('Error fetching pipeline:', error);
        setError('Failed to load pipeline. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPipeline();
  }, [id]);

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

  const handleDeleteStage = async (stageId) => {
    // If it's an existing stage (not temp), delete from backend
    if (!stageId.toString().startsWith('temp-')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/stages/${stageId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to delete stage');
          return;
        }
      } catch (error) {
        console.error('Error deleting stage:', error);
        setError('Failed to delete stage. Please try again.');
        return;
      }
    }

    // Remove from local state
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

      // Update pipeline name and currency
      const pipelineResponse = await fetch(`${API_URL}/pipelines/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: pipelineName.trim(),
          currency
        })
      });

      if (!pipelineResponse.ok) {
        const errorData = await pipelineResponse.json();
        throw new Error(errorData.error || 'Failed to update pipeline');
      }

      // Update/create stages
      const existingStages = stages.filter(s => !s.id.toString().startsWith('temp-'));
      const newStages = stages.filter(s => s.id.toString().startsWith('temp-'));

      // Update existing stages
      for (const stage of existingStages) {
        const stageResponse = await fetch(`${API_URL}/stages/${stage.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: stage.name,
            probability: parseFloat(stage.probability) || 0,
            color: stage.color
          })
        });

        if (!stageResponse.ok) {
          const errorData = await stageResponse.json();
          throw new Error(errorData.error || `Failed to update stage: ${stage.name}`);
        }
      }

      // Create new stages
      for (const stage of newStages) {
        const stageResponse = await fetch(`${API_URL}/pipelines/${id}/stages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: stage.name,
            probability: parseFloat(stage.probability) || 0,
            color: stage.color
          })
        });

        if (!stageResponse.ok) {
          const errorData = await stageResponse.json();
          throw new Error(errorData.error || `Failed to create stage: ${stage.name}`);
        }
      }

      // Navigate back to leads
      navigate('/leads');
    } catch (error) {
      console.error('Error updating pipeline:', error);
      setError(`Failed to update pipeline: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/leads');
  };

  if (isLoading) {
    return (
      <div className="pipeline-add-container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pipeline-add-container">
      <div className="pipeline-add-header">
        <div className="pipeline-add-header-left">
          <input
            type="text"
            className="pipeline-name-input"
            value={pipelineName}
            onChange={(e) => setPipelineName(e.target.value)}
            placeholder="Pipeline Name"
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

export default PipelineEdit;

