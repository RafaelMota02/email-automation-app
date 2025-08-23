import { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';

export default function Settings() {
  const { addToast } = useToast();
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: 587,
    username: '',
    password: '',
    encryption: 'tls',
    fromEmail: '',
    testEmail: '',
  });

  const [isTesting, setIsTesting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSmtpConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const trimConfig = (config) => {
    return {
      host: config.host.trim(),
      port: config.port,
      username: config.username.trim(),
      password: config.password.trim(),
      encryption: config.encryption,
      fromEmail: config.fromEmail.trim(),
      testEmail: config.testEmail.trim(),
    };
  };

  const handleTest = async (e) => {
    e.preventDefault();
    setIsTesting(true);
    
    try {
      const token = localStorage.getItem('token');
      const trimmedConfig = trimConfig(smtpConfig);
      
      const response = await fetch('/api/smtp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(trimmedConfig)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        addToast('Test email sent successfully!', 'success');
      } else {
        const errorMessage = result.errorCode 
          ? `${result.message} - ${result.remediation}`
          : (result.message || 'Failed to send test email');
        addToast(errorMessage, 'error');
      }
    } catch (err) {
      addToast(`An unexpected error occurred: ${err.message}`, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const trimmedConfig = trimConfig(smtpConfig);
      
      const response = await fetch('/api/smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(trimmedConfig)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        addToast('SMTP configuration saved successfully!', 'success');
      } else {
        addToast(result.message || 'Failed to save SMTP configuration', 'error');
      }
    } catch (error) {
      console.error('Failed to update SMTP settings:', error);
      addToast('An error occurred while saving SMTP configuration', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Email Settings</h1>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <form onSubmit={handleSave}>
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">SMTP Configuration</h2>
            
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-gray-600 mb-2">SMTP Host</label>
                <input
                  type="text"
                  name="host"
                  value={smtpConfig.host}
                  onChange={handleChange}
                  placeholder="smtp.example.com"
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-600 mb-2">Port</label>
                <input
                  type="number"
                  name="port"
                  value={smtpConfig.port}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-600 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={smtpConfig.username}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-600 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={smtpConfig.password}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-600 mb-2">Encryption</label>
                <select
                  name="encryption"
                  value={smtpConfig.encryption}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                  <option value="none">None</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-600 mb-2">From Email</label>
                <input
                  type="email"
                  name="fromEmail"
                  value={smtpConfig.fromEmail}
                  onChange={handleChange}
                  placeholder="noreply@example.com"
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-gray-600 mb-2">Test Email Address</label>
              <input
                type="email"
                name="testEmail"
                value={smtpConfig.testEmail}
                onChange={handleChange}
                placeholder="test@example.com"
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            
            <div className="mt-6 bg-blue-50 p-3 sm:p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-1 sm:mb-2 text-sm sm:text-base">Provider Guides</h3>
              <ul className="list-disc pl-5 text-xs sm:text-sm text-blue-700 space-y-1">
                <li><span className="font-medium">Gmail:</span> Port 465 with SSL, requires app password</li>
                <li><span className="font-medium">Outlook:</span> Port 587 with TLS</li>
                <li><span className="font-medium">Yahoo:</span> Port 465 with SSL or 587 with TLS</li>
                <li><span className="font-medium">Zoho:</span> Port 465 with SSL or 587 with TLS</li>
              </ul>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 bg-gray-50 flex justify-end gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting}
              className={`px-4 py-2 sm:px-6 sm:py-3 bg-gray-600 text-white font-medium rounded-lg shadow-md hover:bg-gray-700 transition-all duration-200 text-sm sm:text-base ${isTesting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isTesting ? 'Testing...' : 'Test'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-sm sm:text-base"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
