import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CreateDatabaseButton from '../components/CreateDatabaseButton';
import { useToast } from '../context/ToastContext.jsx';
import { API_BASE_URL } from '../config';

export default function Databases() {
  const { addToast } = useToast();
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleDatabaseCreated = (newDatabase) => {
    setDatabases([newDatabase, ...databases]);
    addToast(`Database "${newDatabase.name}" created successfully!`, 'success');
  };

  const handleDelete = async (databaseId) => {
    if (!window.confirm('Are you sure you want to delete this database?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/databases/${databaseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setDatabases(databases.filter(db => db.id !== databaseId));
      addToast('Database deleted successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to delete database', 'error');
    }
  };

  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          addToast('Not authenticated', 'error');
          return;
        }
        const response = await axios.get(`${API_BASE_URL}/databases`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDatabases(response.data);
      } catch (err) {
        addToast(err.response?.data?.error || 'Failed to load databases', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDatabases();
  }, [addToast]);

  if (loading) return <div>Loading databases...</div>;

  return (
    <div className="p-4 sm:p-8 lg:p-16 pt-4 sm:pt-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">My Databases</h1>
        <CreateDatabaseButton 
          onDatabaseCreated={handleDatabaseCreated}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base" 
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {databases?.length > 0 ? (
  databases.map((db) => (
          <div key={db.id} className="border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-5 bg-gradient-to-br from-indigo-50 to-white flex flex-col justify-between min-h-[200px] sm:h-64">
            <div>
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-lg sm:text-xl font-bold text-indigo-700 truncate">{db.name}</h2>
              </div>
              <div className="space-y-1 sm:space-y-2 mt-2">
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Created: {new Date(db.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-start text-xs sm:text-sm text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    Variables: 
                    <div className="flex flex-wrap gap-1 mt-1">
                      {db.variables?.slice(0, 3).map((variable, idx) => (
                        <span 
                          key={idx} 
                          className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-indigo-100 text-indigo-800 rounded text-2xs sm:text-xs font-medium"
                        >
                          {variable}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Contacts: <span className="ml-1 font-medium">{db.contact_count || 0}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-3 sm:mt-4 border-t border-gray-100 pt-2 sm:pt-3">
              <Link
                to={`/databases/${db.id}`}
                className="p-1.5 sm:p-2 rounded-full hover:bg-indigo-100 transition-colors duration-200"
                title="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </Link>
              <button
                className="p-1.5 sm:p-2 rounded-full hover:bg-red-100 transition-colors duration-200"
                onClick={() => handleDelete(db.id)}
                title="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          ))
) : (
          <div className="col-span-full p-6 sm:p-12 text-center border-2 border-dashed border-indigo-200 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-50 to-white">
            <div className="inline-block p-4 sm:p-6 bg-white rounded-full shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 sm:h-20 sm:w-20 mx-auto text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    </div>
            <h3 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-bold text-indigo-800">No databases yet</h3>
            <p className="mt-1 sm:mt-2 text-gray-600 max-w-md mx-auto text-sm sm:text-base">Create your first database to manage contacts and start sending campaigns</p>
            <div className="mt-4 sm:mt-6">
              <CreateDatabaseButton 
                onDatabaseCreated={handleDatabaseCreated}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base" 
      />
    </div>
  </div>
)}
      </div>
    </div>
  );
}
