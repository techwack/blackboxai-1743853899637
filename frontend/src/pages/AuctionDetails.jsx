import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api.js';
import { formatCurrency, formatDate, timeRemaining } from '../utils/helpers.js';
import BidForm from '../components/BidForm.jsx';
import BidHistory from '../components/BidHistory.jsx';

export default function AuctionDetails({ socket }) {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remainingTime, setRemainingTime] = useState('');

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const { data } = await api.get(`/auctions/${id}`);
        setAuction(data);
        startCountdown(data.endDate);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch auction');
      } finally {
        setLoading(false);
      }
    };

    const startCountdown = (endDate) => {
      const interval = setInterval(() => {
        setRemainingTime(timeRemaining(endDate));
      }, 1000);
      return () => clearInterval(interval);
    };

    fetchAuction();

    socket.on('newBid', (bidData) => {
      if (bidData.auctionId === id) {
        setAuction(prev => ({
          ...prev,
          currentPrice: bidData.amount,
          bids: [...prev.bids, {
            amount: bidData.amount,
            bidder: { username: bidData.bidder },
            timestamp: new Date()
          }]
        }));
      }
    });

    return () => {
      socket.off('newBid');
    };
  }, [id, socket]);

  if (loading) return <div className="text-center py-8">Loading auction...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img 
              src={auction.images[0]} 
              alt={auction.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-6 md:w-1/2">
            <h1 className="text-2xl font-bold mb-2">{auction.title}</h1>
            <p className="text-gray-600 mb-4">{auction.description}</p>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500">Current Bid</span>
                <span className="text-2xl font-bold text-primary-600">
                  {formatCurrency(auction.currentPrice)}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500">Time Remaining</span>
                <span className="font-medium">
                  {remainingTime || timeRemaining(auction.endDate)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Seller</span>
                <span className="font-medium">{auction.seller.username}</span>
              </div>
            </div>

            <BidForm 
              auctionId={auction._id} 
              currentPrice={auction.currentPrice} 
              socket={socket}
            />
          </div>
        </div>

        <div className="p-6 border-t">
          <h2 className="text-xl font-semibold mb-4">Bid History</h2>
          <BidHistory bids={auction.bids} />
        </div>
      </div>
    </div>
  );
}