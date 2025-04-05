import { useEffect, useState } from 'react';
import AuctionCard from '../components/AuctionCard.jsx';
import api from '../services/api.js';

export default function Home({ socket }) {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const { data } = await api.get('/auctions');
        setAuctions(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch auctions');
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();

    // Listen for new bids
    socket.on('newBid', (bidData) => {
      setAuctions(prev => prev.map(auction => 
        auction._id === bidData.auctionId ? { 
          ...auction, 
          currentPrice: bidData.amount 
        } : auction
      ));
    });

    return () => {
      socket.off('newBid');
    };
  }, [socket]);

  if (loading) return <div className="text-center py-8">Loading auctions...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {auctions.map(auction => (
        <AuctionCard 
          key={auction._id} 
          auction={auction} 
          socket={socket} 
        />
      ))}
    </div>
  );
}