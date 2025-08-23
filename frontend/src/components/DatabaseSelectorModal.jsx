import { useState } from 'react';

export default function DatabaseSelectorModal({ databases, show, onClose, onSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  if (!show) return null;

  const filteredDbs = databases.filter(db =>
    db.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Select Database</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <input
          type="text"
          placeholder="Search databases..."
          className="w-full p-2 border rounded mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="max-h-96 overflow-y-auto space-y-2">
          {filteredDbs.map(db => (
            <button
              key={db.id}
              onClick={() => onSelect(db)}
              className="w-full p-3 text-left hover:bg-gray-100 rounded border"
            >
              <h3 className="font-medium">{db.name}</h3>
              <p className="text-sm text-gray-500">
                {db.variables?.join(', ') || 'No variables'} ({db.contact_count || 0} contacts)
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
