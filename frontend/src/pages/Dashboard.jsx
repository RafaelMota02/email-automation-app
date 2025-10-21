import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CampaignList from '../components/CampaignList';
import SendCampaignForm from '../components/SendCampaignForm';
import StatCard from '../components/StatCard';
import { useToast } from '../context/ToastContext.js';
import { API_BASE_URL } from '../config';
import useAuth from '../context/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalRecipients: 0,
    last30DaysCampaigns: 0,
    last30DaysRecipients: 0
  });

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/campaigns/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStats(res.data);
    } catch (err) {
      addToast('Failed to load dashboard statistics: ' + (err.response?.data?.error || err.message), 'error');
    }
  }, [addToast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const [showCompose, setShowCompose] = useState(false);

  const handleCampaignSent = () => {
    setShowCompose(false);
    fetchStats();
    addToast('Campaign sent successfully!', 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Welcome Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 👋
          </h1>
          <p className="text-lg text-gray-600">Manage your email campaigns and track performance</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 sm:mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <StatCard
              title="Total Campaigns"
              value={stats.totalCampaigns}
              trend={`${stats.last30DaysCampaigns || 0} in last 30 days`}
              icon="📨"
            />
            <StatCard
              title="Emails Sent"
              value={stats.totalRecipients}
              trend={`${stats.last30DaysRecipients || 0} in last 30 days`}
              icon="📩"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="group">
              <div
                onClick={() => setShowCompose(true)}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 group-hover:border-indigo-200"
              >
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl w-fit mb-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Create Campaign</h3>
                <p className="text-sm text-gray-600">Design and send a new email campaign</p>
              </div>
            </div>

            <Link to="/databases" className="block group">
              <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-100 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group-hover:border-blue-200">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-green-600 rounded-xl w-fit mb-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Manage Databases</h3>
                <p className="text-sm text-gray-600">Upload and organize your contact lists</p>
              </div>
            </Link>

            <Link to="/settings" className="block group">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group-hover:border-purple-200">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl w-fit mb-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Account Settings</h3>
                <p className="text-sm text-gray-600">Configure your SMTP and preferences</p>
              </div>
            </Link>

            <div className="group">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 group-hover:border-amber-200">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl w-fit mb-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">View Analytics</h3>
                <p className="text-sm text-gray-600">Track campaign performance metrics</p>
              </div>
            </div>
          </div>
        </div>

        {showCompose ? (
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-100 relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-100 to-transparent rounded-full -translate-y-8 translate-x-8"></div>

            <div className="relative">
              <button
                onClick={() => setShowCompose(false)}
                className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Campaigns
              </button>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Create New Campaign</h2>
              <p className="text-gray-600 mb-6">Send personalized emails to your audience</p>
              <SendCampaignForm onCampaignSent={handleCampaignSent} />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Your Campaigns</h2>
                <p className="text-gray-600">View and manage all your email campaigns</p>
              </div>
              <button
                onClick={() => setShowCompose(!showCompose)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm sm:text-base inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {showCompose ? 'Cancel' : 'New Campaign'}
              </button>
            </div>
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
              <CampaignList onCreateCampaign={() => setShowCompose(true)} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
