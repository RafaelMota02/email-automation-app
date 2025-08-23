import { useState } from 'react';
import ReactDOM from 'react-dom';
//// Remove unused Link import
import axios from 'axios';
import Papa from 'papaparse';
import useAuth from '../context/useAuth';

export default function CreateDatabaseButton({ onDatabaseCreated }) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [csvData, setCsvData] = useState('');
  const [emailColumn, setEmailColumn] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [headers, setHeaders] = useState([]);

  const parseCSV = (csv) => {
    try {
      const results = Papa.parse(csv.trim(), {
        header: true,
        skipEmptyLines: true,
        transform: (value) => {
          // Handle empty strings
          if (value === '') return null;
          if (typeof value !== 'string') return value;
          // Convert numeric values
          if (/^-?\d+\.?\d*$/.test(value)) return parseFloat(value);
          // Convert boolean values
          if (value.toLowerCase() === 'true') return true;
          if (value.toLowerCase() === 'false') return false;
          // Convert null values
          if (value === 'null') return null;
          // Convert date strings to ISO format
          if (Date.parse(value)) return new Date(value).toISOString();
          return value;
        }
      });

      if (results.errors.length > 0) {
        throw new Error(`CSV Error: ${results.errors[0].message}`);
      }

      if (!results.meta.fields?.length) {
        throw new Error('CSV must contain a header row');
      }

      return {
        headers: results.meta.fields,
        data: results.data
      };
    } catch (err) {
      console.error('CSV parsing failed:', err);
      throw new Error(`CSV processing error: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      
      if (!user) throw new Error('Not authenticated');
      if (!name.trim()) throw new Error('Database name is required');
      if (!csvData.trim()) throw new Error('CSV data is required');

      const parsed = parseCSV(csvData);
      setHeaders(parsed.headers);
      
      // If email column hasn't been set, try to find an email column
      let emailCol = emailColumn;
      if (!emailCol) {
        emailCol = parsed.headers.find(h => h.toLowerCase().includes('email')) || parsed.headers[0];
        setEmailColumn(emailCol);
      }
      
      const requestData = {
        name: name.trim(),
        columns: parsed.headers,
        csvData: csvData,
        emailColumn: emailCol
      };
      
      const response = await axios.post('/api/databases', requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });

      if (typeof onDatabaseCreated === 'function') {
        onDatabaseCreated(response.data);
      }
      setShowModal(false);
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Failed to create database');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex gap-4">
      <button
        onClick={() => setShowModal(true)}
        className="bg-indigo-600 text-white px-4 py-3 rounded-md font-semibold hover:bg-indigo-700 transition"
      >
        Create Database
      </button>

      {showModal && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Create New Database</h2>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2 font-medium">
                  Database Name
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded mt-1"
                    required
                  />
                </label>
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-medium">
                  CSV Data
                  <textarea
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    className="w-full h-64 p-2 border rounded mt-1 font-mono text-sm"
                    placeholder={`name,email,company\nJohn Doe,john@example.com,Acme Inc\nJane Smith,jane@example.com,XYZ Corp`}
                    required
                  />
                </label>
              </div>
              
              {headers.length > 0 && (
                <div className="mb-4">
                  <label className="block mb-2 font-medium">
                    Email Column
                    <select
                      value={emailColumn}
                      onChange={(e) => setEmailColumn(e.target.value)}
                      className="w-full p-2 border rounded mt-1"
                      required
                    >
                      {headers.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-3 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-3 text-white font-semibold rounded-md transition ${
                    isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isLoading ? 'Creating...' : 'Create Database'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
