import React, { useState, useEffect } from 'react';
import './Documents.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function Documents({ leadId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [leadId]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads/${leadId}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch(`${API_URL}/leads/${leadId}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments([data.document, ...documents]);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getDocumentIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['xls', 'xlsx'].includes(ext)) return '📊';
    if (['ppt', 'pptx'].includes(ext)) return '📊';
    return '📑';
  };

  if (loading) {
    return <div className="documents-loading">Loading documents...</div>;
  }

  return (
    <div className="documents-panel">
      <div className="documents-header">
        <h2>Documents</h2>
        <div className="documents-header-actions">
          <span className="documents-count">{documents.length}</span>
          <label className="upload-document-btn">
            {uploading ? 'Uploading...' : '+ Upload Document'}
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={handleDocumentUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div className="documents-list">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <div key={doc.id} className="document-item">
              <div className="document-icon">{getDocumentIcon(doc.document_name)}</div>
              <div className="document-content">
                <div className="document-name">{doc.document_name}</div>
                <div className="document-meta">
                  {formatFileSize(doc.document_size)} · {formatDate(doc.created_at)} · {doc.user_name || 'You'}
                </div>
              </div>
              <a 
                href={`${API_URL}/leads/${leadId}/documents/${doc.id}/download`}
                className="document-download-btn"
                download
              >
                Download
              </a>
            </div>
          ))
        ) : (
          <div className="documents-empty">
            <p>No documents uploaded yet. Upload your first document above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Documents;







