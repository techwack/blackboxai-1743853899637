import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { uploadImage } from '../services/imageService.js';

export default function AuctionCreationForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startingPrice: '',
    endDate: '',
    images: []
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setImageFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Upload images first
      const imageUrls = await Promise.all(
        imageFiles.map(file => uploadImage(file))
      );

      // Create auction with image URLs
      const { data } = await api.post('/auctions', {
        ...formData,
        images: imageUrls,
        startingPrice: Number(formData.startingPrice)
      });

      navigate(`/auctions/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Create New Auction</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Auction Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
            minLength="5"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startingPrice" className="block text-sm font-medium text-gray-700">
              Starting Price ($)
            </label>
            <input
              type="number"
              id="startingPrice"
              name="startingPrice"
              value={formData.startingPrice}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="images" className="block text-sm font-medium text-gray-700">
            Images (Max 5)
          </label>
          <input
            type="file"
            id="images"
            name="images"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            multiple
            accept="image/*"
            max="5"
          />
          <p className="mt-1 text-sm text-gray-500">
            {imageFiles.length} image(s) selected
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6 py-2"
          >
            {loading ? 'Creating...' : 'Create Auction'}
          </button>
        </div>
      </form>
    </div>
  );
}