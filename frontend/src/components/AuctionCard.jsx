import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import BidForm from './BidForm.jsx';

export default function AuctionCard({ auction, socket }) {
  const [currentPrice, setCurrentPrice] = useState(auction.currentPrice);
  const [isNewBid, setIsNewBid] = useState(false);

  // Format time remaining
  const timeRemaining = formatDistanceToNow(new Date(auction.endDate), {
    addSuffix: true
  });

  // Handle new bids from socket
  socket.on('newBid', (bidData) => {
    if (bidData.auctionId === auction._id) {
      setCurrentPrice(bidData.amount);
      setIsNewBid(true);
      setTimeout(() => setIsNewBid(false), 1500);
    }
  });

  return (
    <div className={`rounded-xl shadow-md overflow-hidden transition-all ${isNewBid ? 'new-bid' : ''}`}>
      <div className="relative h-48 bg-gray-200">
        <img 
          src={auction.images[0]} 
          alt={auction.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white font-semibold text-lg truncate">
            {auction.title}
          </h3>
        </div>
      </div>

      <div className="p-4 bg-white">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-500">Current Bid</span>
          <span className="font-bold text-lg">${currentPrice}</span>
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-500">Ends {timeRemaining}</span>
          <span className="text-sm bg-primary-100 text-primary-800 px-2 py-1 rounded">
            {auction.bids.length} bids
          </span>
        </div>

        <div className="flex space-x-2">
          <Link 
            to={`/auctions/${auction._id}`}
            className="btn-secondary flex-1 text-center"
          >
            View Details
          </Link>
          <BidForm 
            auctionId={auction._id} 
            currentPrice={currentPrice} 
            socket={socket}
          />
        </div>
      </div>
    </div>
  );
}