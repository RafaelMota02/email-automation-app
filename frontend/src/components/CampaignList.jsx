import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ConfirmationModal from './ConfirmationModal';
import SocketContext from '../context/SocketContext';
import useAuth from '../context/useAuth';

export default function CampaignList({ onCreateCampaign }) {
  const socket = useContext(SocketContext);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  const handleResendInit = (campaignId) => {
    setSelectedCampaignId(campaignId);
    setShowConfirmation(true);
  };

  const handleResendConfirm = async () => {
    setShowConfirmation(false);
    const campaignId = selectedCampaignId;
    
    if (!campaignId) {
      console.error('No campaign selected for resend');
      return;
    }

      try {
        await axios.post(`/api/campaigns/${campaignId}/resend`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Refetch the entire campaigns list to ensure we have the latest data
      const res = await axios.get('/api/campaigns', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setCampaigns(res.data);
    } catch (err) {
      console.error('Failed to resend campaign:', err);
      alert(`Failed to resend campaign: ${err.message} (Status: ${err.response?.status || 'no response'})`);
    }
  };


  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await axios.get('/api/campaigns', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setCampaigns(res.data);
      } catch (err) {
        console.error('Failed to fetch campaigns:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);
  
  const { user } = useAuth();

  useEffect(() => {
    if (!socket || !user) return;

    const connectSocket = async () => {
      try {
        // Connect socket when user is authenticated
        if (!socket.connected) {
          await socket.connect();
        }
        console.log('Socket connected');
      } catch (error) {
        console.error('Socket connection failed:', error);
      }
    };

    connectSocket();

    const handleCampaignUpdate = (updatedCampaign) => {
      setCampaigns(prevCampaigns => {
        // Check if campaign already exists
        const exists = prevCampaigns.some(c => c.id === updatedCampaign.id);

        if (exists) {
          // Update existing campaign
          return prevCampaigns.map(c =>
            c.id === updatedCampaign.id ? updatedCampaign : c
          );
        } else {
          // Add new campaign (for resends)
          return [updatedCampaign, ...prevCampaigns];
        }
      });
    };

    socket.on('campaign-updated', handleCampaignUpdate);

    return () => {
      socket.off('campaign-updated', handleCampaignUpdate);
      // Disconnect socket when component unmounts
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [socket, user]);

  if (loading) return <div className="text-center py-8">Loading campaigns...</div>;

  if ((campaigns || []).length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border border-gray-200 inline-block">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0l-2.5 2.5M6 13l2.5 2.5" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
          <p className="text-gray-600 mb-6">You haven't created any email campaigns yet. Start your first one to begin reaching your audience!</p>
          <button
            onClick={() => {
              console.log('Create campaign button clicked');
              if (onCreateCampaign) {
                onCreateCampaign();
                console.log('onCreateCampaign called');
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Your First Campaign
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(campaigns || []).map((campaign, index) => (
        <div key={campaign?.id || `campaign-${index}`} className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-gray-50 to-transparent rounded-full -translate-y-4 translate-x-4"></div>

          <div className="flex-1 min-w-0 relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/campaigns/${campaign.id}`}
                  className="block group/link"
                >
                  <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover/link:text-indigo-600 transition-colors truncate">{campaign.subject}</h3>
                  <div className="text-gray-600 text-sm sm:text-base line-clamp-2 mb-4">{campaign.message}</div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        {(campaign.recipients || []).length} recipients
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString() : 'Not sent yet'}
                      </div>
                      {campaign.resend_count > 0 && (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Resent {campaign.resend_count} time{campaign.resend_count > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleResendInit(campaign.id);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm inline-flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Resend
                    </button>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
      <ConfirmationModal
        isOpen={showConfirmation}
        message="Are you sure you want to resend this campaign? This will create a new version and send to all recipients."
        onConfirm={handleResendConfirm}
        onCancel={() => setShowConfirmation(false)}
      />
    </div>
  );
}
