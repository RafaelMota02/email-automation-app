import { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import SocketContext from '../context/SocketContext';
import useAuth from '../context/useAuth';
import { replacePlaceholders } from '../utils/replacePlaceholders';
import { API_BASE_URL } from '../config';
import { useToast } from '../context/ToastContext.jsx';

export default function CampaignDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const socket = useContext(SocketContext);
  const { addToast } = useToast();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await axios.get(`/api/campaigns/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setCampaign(res.data);
      } catch (err) {
        addToast('Failed to load campaign details: ' + (err.response?.data?.error || err.message), 'error');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchCampaign();
  }, [id, user, addToast]);

  useEffect(() => {
    if (!socket) return;

    const handleCampaignUpdated = (updatedCampaign) => {
      if (updatedCampaign.id === parseInt(id)) {
        setCampaign(updatedCampaign);
        // Show toast when campaign is updated via socket
        if (updatedCampaign.sent_at) {
          addToast(`Campaign ${updatedCampaign.resend_count > 0 ? 'resent' : 'sent'} successfully!`, 'success');
        }
      }
    };

    socket.on('campaign-updated', handleCampaignUpdated);

    return () => {
      socket.off('campaign-updated', handleCampaignUpdated);
    };
  }, [socket, id, addToast]);

  if (loading) return <div className="p-4">Loading campaign details...</div>;
  if (!campaign) return <div className="p-4">Campaign not found</div>;

  // Calculate statistics
  const totalRecipients = campaign.recipients?.length || 0;
  const sentResults = campaign.send_results || [];
  const successCount = sentResults.filter(r => r.success).length;
  const failedCount = sentResults.filter(r => !r.success).length;
  

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6">
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">{campaign.subject}</h1>
            {campaign.sent_at && (
              <div className="text-sm text-gray-500 mt-1">
                <p>Sent on {new Date(campaign.sent_at).toLocaleString()}</p>
              </div>
            )}
          </div>
        <div className="flex space-x-2">
          <Link 
            to="/dashboard"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
          >
            ← Dashboard
          </Link>
        </div>
        </div>

        {/* Source Information */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-md">
          <h3 className="font-semibold mb-1 sm:mb-2">Campaign Source</h3>
          {campaign.database_id ? (
            <p>
              Database: <span className="font-medium">{campaign.database_name}</span>
            </p>
          ) : campaign.file_name ? (
            <p>
              CSV File: <span className="font-medium">{campaign.file_name}</span>
            </p>
          ) : (
            <p>No source information available</p>
          )}
        </div>
        
        {/* Statistics Summary - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700 font-medium">Total Emails</p>
            <p className="text-2xl font-bold">{totalRecipients}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700 font-medium">Sent Successfully</p>
            <p className="text-2xl font-bold">{successCount}</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-700 font-medium">Failed to Send</p>
            <p className="text-2xl font-bold">{failedCount}</p>
          </div>
        </div>
        
        <div className="mb-4 sm:mb-6">
          <h3 className="font-semibold mb-1 sm:mb-2">Email Template</h3>
          <div className="whitespace-pre-wrap p-3 sm:p-4 bg-gray-50 rounded text-sm sm:text-base">
            {campaign.message}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Recipients ({totalRecipients})</h3>
          <div className="bg-gray-50 rounded p-2 sm:p-4 space-y-4">
              {(campaign.recipients || []).map((recipient, index) => {
                // Generate personalized content using the same logic as backend
                const personalizedContent = replacePlaceholders(campaign.message, recipient);
                
                // Get send result by index (since results are stored in same order as recipients)
                const sendResult = sentResults[index];
                
                return (
                  <div key={index} className="py-2 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <div className="mb-2 sm:mb-0">
                        <div className="font-medium break-words">{recipient.email}</div>
                        {recipient.name && <div className="text-gray-600 text-sm">({recipient.name})</div>}
                      </div>
                      <div>
                        {sendResult ? (
                          sendResult.success ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Sent
                            </span>
                          ) : (
                            <div className="flex flex-col items-end">
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full mb-1">
                                Failed
                              </span>
                              {sendResult.error && (
                                <span className="text-xs text-red-600 max-w-48 text-right leading-tight">
                                  {sendResult.error}
                                </span>
                              )}
                            </div>
                          )
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                            Not sent
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {sendResult && sendResult.timestamp && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(sendResult.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    )}
                    
                    <div className="mt-3">
                      <details className="group">
                        <summary className="flex items-center cursor-pointer text-sm font-medium text-blue-600">
                          <span>View personalized email</span>
                          <svg className="ml-1 w-4 h-4 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </summary>
                        <div className="mt-2 bg-white p-3 rounded border prose max-w-full overflow-x-auto">
                          <div dangerouslySetInnerHTML={{__html: `
                            <p><strong>Subject:</strong> ${campaign.subject}</p>
                            <hr class="my-2"/>
                            ${personalizedContent.replace(/\n/g, '<br/>')}
                          `}} />
                        </div>
                      </details>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
      </div>
    </div>
  );
}
