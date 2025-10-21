import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext.js';
import { API_BASE_URL } from '../config';

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

  const [emailProvider, setEmailProvider] = useState('sendgrid');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [userInfo, setUserInfo] = useState({ email: '', id: '' });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const token = localStorage.getItem('token');

        // Load user info
        const userResponse = await fetch(`${API_BASE_URL}/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserInfo(userData.user);
        }

        // Load email provider
        const providerResponse = await fetch(`${API_BASE_URL}/smtp/provider`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (providerResponse.ok) {
          const providerData = await providerResponse.json();
          setEmailProvider(providerData.provider);
        }

        // Load SMTP config
        const smtpResponse = await fetch(`${API_BASE_URL}/smtp`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (smtpResponse.ok) {
          const smtpData = await smtpResponse.json();
          setSmtpConfig(prev => ({
            ...prev,
            host: smtpData.host || '',
            port: smtpData.port ? parseInt(smtpData.port) : 587,
            username: smtpData.username || '',
            password: '', // Don't load password for security
            encryption: smtpData.encryption || 'tls',
            fromEmail: smtpData.from_email || '',
          }));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        addToast('Failed to load settings', 'error');
      } finally {
        setIsLoadingConfig(false);
      }
    };

    loadSettings();
  }, [addToast]);

  const handleProviderChange = async (newProvider) => {
    if (newProvider === 'smtp' && !smtpConfig.host) {
      addToast('Please configure your SMTP settings first', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/smtp/provider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ provider: newProvider })
      });

      if (response.ok) {
        setEmailProvider(newProvider);
        addToast(`Email provider set to ${newProvider}`, 'success');
      } else {
        // If API fails, still update locally (fall forward approach)
        console.warn('Failed to save email provider preference remotely, updating locally');
        setEmailProvider(newProvider);
        addToast(`Email provider changed to ${newProvider} (local)`, 'success');
      }
    } catch (error) {
      // If API call fails, still update locally so the UI works
      console.warn('Error updating email provider:', error);
      setEmailProvider(newProvider);
      addToast(`Email provider changed to ${newProvider} (local)`, 'success');
    }
  };

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

      const response = await fetch(`${API_BASE_URL}/smtp/test`, {
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
    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      const trimmedConfig = trimConfig(smtpConfig);

      const response = await fetch(`${API_BASE_URL}/smtp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(trimmedConfig)
      });

      if (response.ok) {
        await response.json(); // We don't need the result, just consume the response
        addToast('SMTP configuration saved successfully!', 'success');
      } else {
        // Handle non-200 responses
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          addToast(result.message || 'Failed to save SMTP configuration', 'error');
        } else {
          const text = await response.text();
          addToast(`Server error: ${response.status} - ${text}`, 'error');
        }
      }
    } catch (error) {
      console.error('Failed to update SMTP settings:', error);
      addToast('An error occurred while saving SMTP configuration', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            Email Settings
          </h1>
          <p className="text-lg text-gray-600">Configure your SMTP settings and email preferences</p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-2xl mb-8 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">How Email Sending Works</h3>
              <div className="text-sm text-blue-800 space-y-3">
                <div>
                  <strong className="font-medium">SendGrid (Recommended):</strong> Used for actual campaign emails.
                  Provides reliable delivery, analytics, and professional email infrastructure.
                  Automatically configured and ready to use.
                </div>
                <div>
                  <strong className="font-medium">SMTP:</strong> Used for testing and learning purposes only.
                  Allows you to test SMTP connections from various providers (Gmail, Outlook, etc.).
                  Actual campaign sending will still use SendGrid regardless of this setting.
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-yellow-800 font-medium text-xs">Note:</span>
                  </div>
                  <p className="text-yellow-800 text-xs mt-1 ml-6">
                    Gmail and other personal email providers have strict sending limits and security restrictions.
                    For sending actual marketing campaigns, always use SendGrid.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isLoadingConfig ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading settings...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Account Information */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">Account Information</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-gray-600 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={userInfo.email}
                      readOnly
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-2">User ID</label>
                    <input
                      type="text"
                      value={userInfo.id}
                      readOnly
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Email Provider Selection */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">Email Provider</h2>
                <p className="text-gray-600 mb-4 text-sm">
                  Choose which email service to use for sending campaigns. SendGrid is recommended for production use.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    emailProvider === 'sendgrid'
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      value="sendgrid"
                      checked={emailProvider === 'sendgrid'}
                      onChange={() => handleProviderChange('sendgrid')}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        emailProvider === 'sendgrid' ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                      }`}></div>
                      <div>
                        <h3 className="font-semibold text-gray-900">SendGrid</h3>
                        <p className="text-sm text-gray-600">Professional email delivery service</p>
                      </div>
                    </div>
                  </label>

                  <label className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    emailProvider === 'smtp'
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      value="smtp"
                      checked={emailProvider === 'smtp'}
                      onChange={() => handleProviderChange('smtp')}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        emailProvider === 'smtp' ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                      }`}></div>
                      <div>
                        <h3 className="font-semibold text-gray-900">SMTP</h3>
                        <p className="text-sm text-gray-600">Direct SMTP connection</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* SMTP Configuration */}
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
                      <li><strong>Gmail:</strong> Port 465 with SSL, requires app password</li>
                      <li><strong>Outlook:</strong> Port 587 with TLS</li>
                      <li><strong>Yahoo:</strong> Port 465 with SSL or 587 with TLS</li>
                      <li><strong>Zoho:</strong> Port 465 with SSL or 587 with TLS</li>
                    </ul>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={isTesting}
                    className={`px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm sm:text-base ${
                      isTesting ? 'opacity-50 cursor-not-allowed' : ''
                    } inline-flex items-center gap-2`}
                  >
                    {isTesting ? 'Testing...' : 'Test Connection'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm sm:text-base ${
                      isSaving ? 'opacity-50 cursor-not-allowed' : ''
                    } inline-flex items-center gap-2`}
                  >
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
