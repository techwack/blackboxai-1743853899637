import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import api from '../services/api.js';
import { formatCurrency, formatDate } from '../utils/helpers.js';
import AuctionCard from '../components/AuctionCard.jsx';

export default function Dashboard() {
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [wonAuctions, setWonAuctions] = useState([]);
  const [userBids, setUserBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          { data: active },
          { data: won },
          { data: bids }
        ] = await Promise.all([
          api.get('/auctions?status=active&seller=true'),
          api.get('/auctions?status=ended&seller=true'),
          api.get('/bids')
        ]);
        
        setActiveAuctions(active);
        setWonAuctions(won);
        setUserBids(bids);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="text-center py-8">Loading dashboard...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Your Dashboard</h1>
      
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-lg bg-gray-100 p-1 mb-6">
          {['Active Auctions', 'Won Auctions', 'Your Bids'].map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                `w-full rounded-md py-2 text-sm font-medium leading-5 ${
                  selected
                    ? 'bg-white shadow text-primary-600'
                    : 'text-gray-500 hover:bg-white/[0.12] hover:text-gray-700'
                }`
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>
        
        <Tab.Panels className="mt-2">
          {/* Active Auctions Panel */}
          <Tab.Panel>
            {activeAuctions.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeAuctions.map(auction => (
                  <AuctionCard key={auction._id} auction={auction} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                You have no active auctions
              </div>
            )}
          </Tab.Panel>
          
          {/* Won Auctions Panel */}
          <Tab.Panel>
            {wonAuctions.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {wonAuctions.map(auction => (
                  <div key={auction._id} className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="font-bold text-lg mb-2">{auction.title}</h3>
                    <p className="text-gray-600 mb-2">Winning Bid: {formatCurrency(auction.currentPrice)}</p>
                    <p className="text-sm text-gray-500">Ended: {formatDate(auction.endDate)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                You haven't won any auctions yet
              </div>
            )}
          </Tab.Panel>
          
          {/* Your Bids Panel */}
          <Tab.Panel>
            {userBids.length > 0 ? (
              <div className="space-y-4">
                {userBids.map(bid => (
                  <div key={bid._id} className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{bid.auction?.title || 'Auction'}</h3>
                        <p className="text-gray-600 text-sm">
                          {formatDate(bid.timestamp)}
                        </p>
                      </div>
                      <div className="font-bold text-primary-600">
                        {formatCurrency(bid.amount)}
                      </div>
                    </div>
                    <div className={`mt-2 text-sm ${
                      bid.status === 'winning' 
                        ? 'text-green-600' 
                        : bid.status === 'outbid' 
                          ? 'text-red-600' 
                          : 'text-gray-500'
                    }`}>
                      {bid.status === 'winning' 
                        ? 'Currently winning' 
                        : bid.status === 'outbid' 
                          ? 'Outbid' 
                          : 'Active'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                You haven't placed any bids yet
              </div>
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}