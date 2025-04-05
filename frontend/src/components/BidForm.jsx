import { useState } from 'react';
import api from '../services/api.js';

export default function BidForm({ auctionId, currentPrice, socket }) {
  const [amount, setAmount] = useState(currentPrice + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post(`/auctions/${auctionId}/bid`, { amount });
      socket.emit('placeBid', {
        auctionId,
        amount: data.amount,
        bidder: data.bidder.username
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1">
      <div className="flex">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            min={currentPrice + 1}
            step="1"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="ml-2 btn-primary whitespace-nowrap"
        >
          {loading ? 'Placing...' : 'Place Bid'}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </form>
  );
}