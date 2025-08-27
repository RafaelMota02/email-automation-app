import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CampaignList from '../components/CampaignList';
import SendCampaignForm from '../components/SendCampaignForm';
import StatCard from '../components/StatCard';
import { useToast } from '../context/ToastContext.jsx';
import { API_BASE_URL, API_PREFIX } from '../config';

export default function Dashboard() {
  const { addToast } = useToast();
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalRecipients: 0,
    last30DaysCampaigns: 0,
    last30DaysRecipients: 0
  });

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}${API_PREFIX}/campaigns/stats`, {
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
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Stats Grid */}
        <div className="mb-6 sm:mb-8 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {showCompose ? (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">New Campaign</h2>
            <SendCampaignForm onCampaignSent={handleCampaignSent} />
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
              <h2 className="text-xl sm:text-2xl font-bold">Your Campaigns</h2>
              <button
                onClick={() => setShowCompose(!showCompose)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm sm:text-base"
              >
                {showCompose ? 'Cancel' : 'New Campaign'}
              </button>
            </div>
            <CampaignList />
          </div>
        )}
      </main>
    </div>
  );
}
