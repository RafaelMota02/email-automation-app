import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CreateDatabaseButton from '../components/CreateDatabaseButton';
import { useToast } from '../context/ToastContext.js';
import { API_BASE_URL } from '../config';

// Skeleton component for loading state
const DatabaseSkeleton = () => (
  <div className="border border-gray-200 rounded-xl shadow-lg p-4 sm:p-5 bg-gradient-to-br from-indigo-50 to-white animate-pulse">
    <div className="h-6 bg-gray-300 rounded mb-3 w-3/4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-4 bg-gray-300 rounded w-2/3"></div>
      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
    </div>
    <div className="flex justify-end gap-3 mt-4">
      <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
      <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
    </div>
  </div>
);

// Preview Modal Component
const PreviewModal = ({ database, onClose }) => {
  if (!database) return null;

  const displayContacts = database.data?.slice(0, 10) || [];
  const hasMore = (database.data?.length || 0) > 10;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-indigo-700 truncate">
            Preview: {database.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-auto max-h-[calc(90vh-200px)]">
          <div className="mb-4 text-sm text-gray-600">
            Showing {displayContacts.length} of {database.contact_count || 0} contacts
          </div>

          {displayContacts.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {database.variables?.map((variable, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {variable}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayContacts.map((contact, contactIndex) => (
                    <tr key={contactIndex} className="hover:bg-gray-50">
                      {database.variables?.map((variable, varIndex) => (
                        <td
                          key={varIndex}
                          className={`px-4 py-3 text-sm text-gray-900 ${
                            variable === database.email_column ? 'font-medium text-indigo-600' : ''
                          }`}
                        >
                          {contact[variable] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No contact data available
            </div>
          )}

          {hasMore && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-700">
                And {(database.data?.length || 0) - 10} more contacts...
                <Link
                  to={`/databases/${database.id}`}
                  className="ml-2 text-indigo-600 hover:text-indigo-800 font-medium"
                  onClick={onClose}
                >
                  View full database →
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Databases() {
  const { addToast } = useToast();
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at_desc');
  const [previewDatabase, setPreviewDatabase] = useState(null);

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

  // Filter and sort databases
  const filteredAndSortedDatabases = () => {
    let filtered = databases.filter(db =>
      db.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      db.variables?.some(variable =>
        variable.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    switch (sortBy) {
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'created_at_asc':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'created_at_desc':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'contact_count_desc':
        filtered.sort((a, b) => (b.contact_count || 0) - (a.contact_count || 0));
        break;
      case 'contact_count_asc':
        filtered.sort((a, b) => (a.contact_count || 0) - (b.contact_count || 0));
        break;
      case 'campaign_count_desc':
        filtered.sort((a, b) => (b.campaign_count || 0) - (a.campaign_count || 0));
        break;
      case 'campaign_count_asc':
        filtered.sort((a, b) => (a.campaign_count || 0) - (b.campaign_count || 0));
        break;
      default:
        break;
    }

    return filtered;
  };

  const handleExportCSV = async (database) => {
    try {
      const csvContent = [
        database.variables?.join(','),
        ...(database.data || []).map(row =>
          database.variables?.map(variable => row[variable] || '').join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${database.name}.csv`;
      link.click();

      addToast(`Database "${database.name}" exported successfully!`, 'success');
    } catch {
      addToast('Failed to export database', 'error');
    }
  };

  const handleDuplicate = async (database) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/databases`, {
        name: `${database.name} (Copy)`,
        columns: database.variables || [],
        csvData: [
          database.variables?.join(','),
          ...(database.data || []).map(row =>
            database.variables?.map(variable => row[variable] || '').join(',')
          )
        ].join('\n'),
        emailColumn: database.email_column
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setDatabases([response.data, ...databases]);
      addToast('Database duplicated successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to duplicate database', 'error');
    }
  };

  const handlePreview = (database) => {
    setPreviewDatabase(database);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
            <div className="h-8 bg-gray-300 rounded w-48 animate-pulse"></div>
            <div className="h-10 bg-gray-300 rounded w-36 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <DatabaseSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredDatabases = filteredAndSortedDatabases();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
              My Databases
            </h1>
            <p className="text-lg text-gray-600">Manage and organize your contact databases</p>
          </div>
          <CreateDatabaseButton
            onDatabaseCreated={handleDatabaseCreated}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm sm:text-base inline-flex items-center gap-2"
          >
            New Database
          </CreateDatabaseButton>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search databases by name or variables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
            >
              <option value="created_at_desc">Newest First</option>
              <option value="created_at_asc">Oldest First</option>
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
              <option value="contact_count_desc">Most Contacts</option>
              <option value="contact_count_asc">Fewest Contacts</option>
              <option value="campaign_count_desc">Most Used</option>
              <option value="campaign_count_asc">Least Used</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredDatabases.length > 0 ? (
          filteredDatabases.map((db) => (
            <div key={db.id} className="border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-5 bg-gradient-to-br from-indigo-50 to-white flex flex-col justify-between min-h-[250px] sm:h-72">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-lg sm:text-xl font-bold text-indigo-700 truncate">{db.name}</h2>
                </div>
                <div className="space-y-1 sm:space-y-2">
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
                        {db.variables?.length > 3 && (
                          <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gray-100 text-gray-600 rounded text-2xs sm:text-xs font-medium">
                            +{db.variables.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Contacts: <span className="ml-1 font-medium">{db.contact_count || 0}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                    Campaigns: <span className="ml-1 font-medium">{db.campaign_count || 0}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between gap-2 mt-4 border-t border-gray-100 pt-3">
                <div className="flex gap-1">
                  <Link
                    to={`/databases/${db.id}`}
                    className="p-1.5 sm:p-2 rounded-full hover:bg-indigo-100 transition-colors duration-200"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => handlePreview(db)}
                    className="p-1.5 sm:p-2 rounded-full hover:bg-indigo-100 transition-colors duration-200"
                    title="Preview Contacts"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleExportCSV(db)}
                    className="p-1.5 sm:p-2 rounded-full hover:bg-green-100 transition-colors duration-200"
                    title="Export CSV"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDuplicate(db)}
                    className="p-1.5 sm:p-2 rounded-full hover:bg-blue-100 transition-colors duration-200"
                    title="Duplicate"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    className="p-1.5 sm:p-2 rounded-full hover:bg-red-100 transition-colors duration-200"
                    onClick={() => handleDelete(db.id)}
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
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
            <p className="mt-1 sm:mt-2 text-gray-600 max-w-md mx-auto text-sm sm:text-base">
              {searchQuery ? 'No databases match your search.' : 'Create your first database to manage contacts and start sending campaigns'}
            </p>
            {!searchQuery && (
              <div className="mt-4 sm:mt-6">
                <CreateDatabaseButton
                  onDatabaseCreated={handleDatabaseCreated}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <PreviewModal
        database={previewDatabase}
        onClose={() => setPreviewDatabase(null)}
      />
      </div>
    </div>
  );
}
