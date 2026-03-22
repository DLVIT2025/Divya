import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Community from './pages/Community';
import Navbar from './components/Navbar';
import VoiceAssistant from './components/VoiceAssistant';
import ProtectedRoute from './components/ProtectedRoute';
import Movies from './pages/Movies';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import MovieDetail from './pages/MovieDetail';
import SeatSelection from './pages/SeatSelection';
import Beverages from './pages/Beverages';
import Checkout from './pages/Checkout';
import Ticket from './pages/Ticket';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import WatchParty from './pages/WatchParty';
import ClubDetail from './pages/ClubDetail';
import ProfilePage from './pages/ProfilePage';
import Trending from './pages/Trending';

function App() {
  return (
    <>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/community">Community</Link>
      </nav>

      <main style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/community" element={<Community />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
