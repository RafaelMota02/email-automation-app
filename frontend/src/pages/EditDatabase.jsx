import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Papa from 'papaparse';
import useAuth from '../context/useAuth';

// Function to find email column in headers
function findEmailColumn(headers) {
  const emailPatterns = ['email', 'e-mail', 'EMAIL', 'E-mail'];
  for (const pattern of emailPatterns) {
    const found = headers.find(header => 
      header.toLowerCase().includes(pattern.toLowerCase())
    );
    if (found) return found;
  }
  return headers.length > 0 ? headers[0] : '';
}

// Function to validate email format
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export default function EditDatabase() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [csvData, setCsvData] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [detectedEmailColumn, setDetectedEmailColumn] = useState('');

  useEffect(() => {
    const fetchDatabase = async () => {
      try {
        const response = await axios.get(`/api/databases/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const db = response.data;
        setName(db.name);
        // Convert data back to CSV format
        const csv = Papa.unparse({
          fields: db.columns,
          data: db.data
        });
        setCsvData(csv);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load database');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDatabase();
    }
  }, [id, user]);

  const parseCSV = (csv) => {
    try {
      const results = Papa.parse(csv.trim(), {
        header: true,
        skipEmptyLines: true,
        transform: (value) => {
          if (value === '') return null;
          if (typeof value !== 'string') return value;
          if (/^-?\d+\.?\d*$/.test(value)) return parseFloat(value);
          if (value.toLowerCase() === 'true') return true;
          if (value.toLowerCase() === 'false') return false;
          if (value === 'null') return null;
          if (typeof value === 'string' && !isNaN(Date.parse(value))) return new Date(value).toISOString();
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
      
      const { headers, data } = parseCSV(csvData);
      
      // Find the best email column match
      const emailColumn = findEmailColumn(headers);
      setDetectedEmailColumn(emailColumn);
      
      // Validate email format in the selected column
      const invalidEmails = [];
      data.forEach((row, index) => {
        const email = row[emailColumn];
        if (email && !isValidEmail(email)) {
          invalidEmails.push(`Row ${index + 2}: ${email}`);
        }
      });
      
      if (invalidEmails.length > 0) {
        setError(`Invalid email addresses found:\n${invalidEmails.join('\n')}`);
        return;
      }
      
      await axios.put(`/api/databases/${id}`, {
        name: name.trim(),
        emailColumn,
        data
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      navigate('/databases');
    } catch (err) {
      setError(err.message || 'Failed to update database');
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) return <div>Loading database...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Database</h1>
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
          {detectedEmailColumn && (
            <p className="text-sm text-gray-600 mt-1">
              Detected email column: <span className="font-bold">{detectedEmailColumn}</span>
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">
            CSV Data
            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              className="w-full h-64 p-2 border rounded mt-1 font-mono text-sm"
              placeholder="email,name,age\nuser@example.com,John Doe,30"
              required
            />
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
