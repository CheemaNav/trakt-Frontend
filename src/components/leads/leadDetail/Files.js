import React, { useState, useEffect } from 'react';
import './Files.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function Files({ leadId }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [leadId]);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/leads/${leadId}/files`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/leads/${leadId}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setFiles([data.file, ...files]);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset file input
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

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) return '🖼️';
    if (['pdf'].includes(ext)) return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['xls', 'xlsx'].includes(ext)) return '📊';
    if (['zip', 'rar'].includes(ext)) return '📦';
    return '📎';
  };

  const buildFileUrl = (fileId) => `${API_URL}/leads/${leadId}/files/${fileId}/download`;

  if (loading) {
    return <div className="files-loading">Loading files...</div>;
  }

  return (
    <div className="files-panel">
      <div className="files-header">
        <h2>Files</h2>
        <div className="files-header-actions">
          <span className="files-count">{files.length}</span>
          <label className="upload-file-btn">
            {uploading ? 'Uploading...' : '+ Upload File'}
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div className="files-list">
        {files.length > 0 ? (
          files.map((file) => {
            const fileUrl = buildFileUrl(file.id);
            return (
              <div key={file.id} className="file-item">
                <div className="file-icon">{getFileIcon(file.file_name)}</div>
                <div className="file-content">
                  <div className="file-name">{file.file_name}</div>
                  <div className="file-meta">
                    {formatFileSize(file.file_size)} · {formatDate(file.created_at)} · {file.user_name || 'You'}
                  </div>
                  <div className="file-url" title={fileUrl}>{fileUrl}</div>
                </div>
                <a 
                  href={fileUrl}
                  className="file-download-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open
                </a>
              </div>
            );
          })
        ) : (
          <div className="files-empty">
            <p>No files uploaded yet. Upload your first file above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Files;







