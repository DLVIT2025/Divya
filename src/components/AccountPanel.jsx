import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Ticket, Users, Sparkles, ChevronDown, Bell } from 'lucide-react';
import './AccountPanel.css';

export default function AccountPanel({ user, onShowNotifications }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setOpen(false);
    navigate('/login');
  };

  const go = (path) => { setOpen(false); navigate(path); };

  return (
    <div className="account-panel-wrap" ref={ref}>
      <button className="account-trigger" onClick={() => setOpen(!open)}>
        <div className="account-avatar-chip">
          {user.name ? user.name[0].toUpperCase() : 'U'}
        </div>
        <span className="account-name">{user.name?.split(' ')[0]}</span>
        <ChevronDown size={14} className={`chevron ${open ? 'rotated' : ''}`} />
      </button>

      {open && (
        <div className="account-dropdown glass-panel animate-fade-in">
          <div className="dropdown-header">
            <div className="dropdown-avatar">{user.name ? user.name[0].toUpperCase() : 'U'}</div>
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>

          <div className="dropdown-divider" />

          <button className="dropdown-item" onClick={() => go('/profile')}>
            <User size={16} /> View Profile
          </button>
          <button className="dropdown-item" onClick={() => go('/profile?tab=bookings')}>
            <Ticket size={16} /> My Bookings
          </button>
          <button className="dropdown-item" onClick={() => go('/profile?tab=clubs')}>
            <Sparkles size={16} /> My Clubs
          </button>
          <button className="dropdown-item" onClick={() => go('/profile?tab=friends')}>
            <Users size={16} /> Friends List
          </button>
          <button className="dropdown-item" onClick={() => { setOpen(false); onShowNotifications?.(); }}>
            <Bell size={16} /> Notifications
          </button>

          <div className="dropdown-divider" />

          <button className="dropdown-item logout" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
