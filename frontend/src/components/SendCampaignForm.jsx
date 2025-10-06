import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import DatabaseSelectorModal from './DatabaseSelectorModal';
import CreateDatabaseButton from './CreateDatabaseButton';

export default function SendCampaignForm({ onCampaignSent }) {
  const [subject, setSubject] = useState('');
  const [template, setTemplate] = useState('');
  const [variables, setVariables] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showDatabases, setShowDatabases] = useState(false);
  const [databases, setDatabases] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState(null);

  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/databases`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setDatabases(response.data);
      } catch {
        setError('Failed to load databases');
      }
    };
    fetchDatabases();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await axios.post(`${API_BASE_URL}/campaigns/parse-csv`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setVariables(response.data.variables);
        setCsvFile(file);
      } catch {
        setError('Error processing CSV file - please check the format');
      }
    }
  });

  const checkSmtpConfigured = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/smtp`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data && response.data.host && response.data.port && response.data.username;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // First check if SMTP is configured
    const smtpConfigured = await checkSmtpConfigured();
    if (!smtpConfigured) {
      setError('Please configure your SMTP settings before sending a campaign');
      return;
    }
    
    // Then check if recipients are selected
    if (!csvFile && !selectedDatabase) {
      setError('Please select recipients using the buttons above before continuing');
      return;
    }
    
    // Then check message content
    const missingFields = [];
    if (!subject) missingFields.push('add a campaign subject');
    if (!template) missingFields.push('write your email content');
    
    if (missingFields.length > 0) {
      setError(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    setIsSending(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('template', template);
      
      if (selectedDatabase) {
        formData.append('databaseId', selectedDatabase.id);
      } else {
        formData.append('file', csvFile);
      }

      // Create and send campaign in one request
      await axios.post(`${API_BASE_URL}/campaigns`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setSubject('');
      setTemplate('');
      setCsvFile(null);
      setVariables([]);
      onCampaignSent?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create campaign');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error && <div className="p-3 text-red-700 bg-red-100 rounded">{error}</div>}

      {isSending && (
        <div className="p-3 bg-indigo-50 text-indigo-800 rounded-md">
          <p className="text-sm">
            <strong>Sending via SendGrid:</strong> Your campaign is being sent through our reliable SendGrid service for optimal deliverability and to avoid Google's SMTP restrictions.
          </p>
        </div>
      )}

      <div>
        <label className="block mb-2 font-medium">Campaign Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={`p-8 border-2 border-dashed rounded cursor-pointer ${
            isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-center">
            {csvFile 
              ? `Selected file: ${csvFile.name}`
              : isDragActive
                ? 'Drop CSV file here'
                : 'Drag & drop CSV, or click to select'}
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={() => setShowDatabases(true)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
          >
            Use Existing Database
          </button>
        </div>
      </div>

      <div>
        <label className="block mb-2 font-medium">Email Template</label>
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="w-full p-2 border rounded h-40"
          placeholder="Use {variables} from your CSV"
        />
        {variables.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            Available variables: {variables.join(', ')}
          </div>
        )}
      </div>

      {selectedDatabase && (
        <div className="p-3 bg-blue-50 text-blue-800 rounded-md flex justify-between items-center">
          <span>
            Using database: <strong>{selectedDatabase.name}</strong>
          </span>
          <button 
            type="button" 
            onClick={() => setSelectedDatabase(null)}
            className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            Change
          </button>
        </div>
      )}

      <DatabaseSelectorModal
        databases={databases}
        show={showDatabases}
        onClose={() => setShowDatabases(false)}
        onSelect={(db) => {
          setSelectedDatabase(db);
          setCsvFile(null);
          setVariables(db.variables);
          setShowDatabases(false); // Close modal after selection
          setTemplate(prev => prev || '');
        }}
      />

      <button
        type="submit"
        disabled={isSending}
        className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {isSending ? 'Creating and Sending Campaign...' : 'Create and Send Campaign'}
      </button>
    </form>
  );
}
