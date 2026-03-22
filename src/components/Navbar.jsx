import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Search, X, Bell } from 'lucide-react';
import { movies } from '../data/mockData';
import AccountPanel from './AccountPanel';
import NotificationCenter from './NotificationCenter';
import './Navbar.css';

export default function Navbar() {
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Read user from localStorage on every render so it's always fresh
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  })();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate('/movies?search=' + encodeURIComponent(query));
      setShowSearch(false);
      setQuery('');
    }
  };

  const suggestions = query ? movies.filter(m =>
    m.title.toLowerCase().includes(query.toLowerCase()) ||
    m.language.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4) : [];

  return (
    <>
      <nav className="navbar glass-panel">
        <div className="container nav-content">
          <Link to="/" className="brand">
            <Film className="brand-icon" />
            <span>Show<span className="brand-highlight">Time</span></span>
          </Link>

          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/movies" className="nav-link">Movies</Link>
            <Link to="/trending" className="nav-link">Trending</Link>
            {user && <Link to="/community" className="nav-link">Community</Link>}
            {user && <Link to="/ticket" className="nav-link">My Tickets</Link>}
            <Link to="/admin" className="nav-link admin-link">Admin</Link>
          </div>

          <div className="nav-actions">
            {user && (
              <button className="icon-btn" title="Notifications" onClick={() => setShowNotifications(true)}>
                <Bell size={20} />
              </button>
            )}
            <button className="icon-btn" title="Search" onClick={() => setShowSearch(true)}>
              <Search size={20} />
            </button>

            {user ? (
              <AccountPanel user={user} onShowNotifications={() => setShowNotifications(true)} />
            ) : (
              <Link to="/login" className="btn-primary login-btn">Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Global Search Overlay */}
      {showSearch && (
        <div className="search-overlay animate-fade-in" onClick={() => setShowSearch(false)}>
          <div className="search-modal" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="modal-search-bar">
              <Search className="search-icon" size={24} />
              <input
                type="text"
                placeholder="Search movies by title, language..."
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <button type="button" className="close-btn" onClick={() => setShowSearch(false)}>
                <X size={24} />
              </button>
            </form>

            {suggestions.length > 0 && (
              <div className="search-suggestions">
                <h4>Suggestions</h4>
                {suggestions.map(m => (
                  <div key={m.id} className="suggestion-item" onClick={() => {
                    navigate(`/movie/${m.id}`);
                    setShowSearch(false);
                    setQuery('');
                  }}>
                    <img src={m.image} alt={m.title} className="suggestion-img" />
                    <div>
                      <p className="suggestion-title">{m.title}</p>
                      <p className="suggestion-meta">{m.language.split(',')[0]} • {m.genre.split(',')[0]}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
