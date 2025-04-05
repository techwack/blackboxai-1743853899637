import { formatCurrency, formatDate } from '../utils/helpers.js';

export default function BidHistory({ bids }) {
  if (!bids || bids.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No bids placed yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bids
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .map((bid, index) => (
          <div 
            key={index} 
            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <span className="font-medium">{bid.bidder?.username || 'Anonymous'}</span>
              <span className="text-gray-500 text-sm ml-2">
                {formatDate(bid.timestamp)}
              </span>
            </div>
            <div className="font-bold text-primary-600">
              {formatCurrency(bid.amount)}
            </div>
          </div>
        ))}
    </div>
  );
}