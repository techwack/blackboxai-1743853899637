import { Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useEffect } from 'react';
import Home from './pages/Home.jsx';
import AuctionDetails from './pages/AuctionDetails.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Navbar from './components/Navbar.jsx';

const socket = io('http://localhost:3000', {
  withCredentials: true,
  autoConnect: false
});

function App() {
  useEffect(() => {
    socket.connect();
    
    socket.on('newBid', (bidData) => {
      console.log('New bid received:', bidData);
      // TODO: Implement real-time bid updates
    });

    return () => {
      socket.off('newBid');
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home socket={socket} />} />
          <Route path="/auctions/:id" element={<AuctionDetails socket={socket} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;