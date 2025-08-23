import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ConfirmationModal from './ConfirmationModal';
import SocketContext from '../context/SocketContext';
import useAuth from '../context/useAuth';

export default function CampaignList() {
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
    
    // Connect socket when user is authenticated
    if (!socket.connected) {
      socket.connect();
    }
    
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

  if (loading) return <div className="text-center py-4">Loading campaigns...</div>;

  return (
    <div className="space-y-4">
      {(campaigns || []).map((campaign, index) => (
        <div key={campaign?.id || `campaign-${index}`} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-all duration-200 relative sm:flex sm:items-start">
          <div className="flex-1 min-w-0">
            <Link 
              to={`/campaigns/${campaign.id}`}
              className="block"
            >
              <h3 className="font-semibold text-lg truncate">{campaign.subject}</h3>
              <div className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base whitespace-pre-wrap line-clamp-2">{campaign.message}</div>
              <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
                <div>
                  Sent to {(campaign.recipients || []).length} recipients • 
                  {campaign.sent_at ? ` ${new Date(campaign.sent_at).toLocaleDateString()}` : ' Not sent yet'}
                </div>
                {campaign.resend_count > 0 && (
                  <div className="text-yellow-600">
                    Resent {campaign.resend_count} time{campaign.resend_count > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </Link>
          </div>
          
          {/* Resend Button - Responsive positioning */}
          <div className="mt-3 sm:mt-0 sm:ml-4 flex justify-end sm:block">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleResendInit(campaign.id);
              }}
              className="px-3 py-1 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-xs sm:text-sm font-medium cursor-pointer shadow-lg"
            >
              Resend
            </button>
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
