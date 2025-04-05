import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { getCookie } from '../utils/helpers.js';

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getCookie('jwt');
        if (token) {
          const { data } = await api.get('/auth/me');
          setUser(data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setIsAuthenticated(false);
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) return null;

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary-600">
          AuctionHub
        </Link>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:text-primary-600">
                <i className="fas fa-user-circle mr-1"></i>
                {user?.username}
              </Link>
              <button 
                onClick={handleLogout}
                className="btn-secondary px-3 py-1 text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-primary-600">
                Login
              </Link>
              <Link 
                to="/register" 
                className="btn-primary px-3 py-1 text-sm"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}