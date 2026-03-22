import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User, Edit2, Save, X, Ticket, Sparkles, Users,
  UserPlus, Trash2, Film, Calendar, MapPin
} from 'lucide-react';
import { api } from '../services/api';
import './ProfilePage.css';

const TABS = ['profile', 'bookings', 'clubs', 'friends'];

export default function ProfilePage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '' });
  const [friendEmail, setFriendEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [p, b, c, f] = await Promise.all([
        api.getProfile(user.id),
        api.getUserBookings(user.id),
        api.getUserClubs(user.id),
        api.getFriends(user.id)
      ]);
      setProfile(p);
      setEditForm({ name: p.name || '', bio: p.bio || '' });
      setBookings(b);
      setClubs(c);
      setFriends(f);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateProfile(user.id, editForm);
      setProfile(updated);
      localStorage.setItem('user', JSON.stringify({ ...user, name: updated.name }));
      setIsEditing(false);
      setSuccess('Profile updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to update profile');
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const res = await api.addFriend(user.id, friendEmail);
      setSuccess(res.message);
      setFriendEmail('');
      setFriends([...friends, res.friend]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('Remove this friend?')) return;
    await api.removeFriend(user.id, friendId);
    setFriends(friends.filter(f => f.id !== friendId));
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    setError('');
    try {
      await api.cancelBooking(bookingId);
      setBookings(bookings.filter(b => b.id !== bookingId));
      setSuccess('Booking cancelled successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to cancel booking');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page animate-fade-in">
      <div className="container">

        {/* Hero */}
        <div className="profile-hero glass-panel">
          <div className="profile-avatar-large">{profile?.name?.[0]?.toUpperCase() || 'U'}</div>
          <div className="profile-hero-info">
            <h1>{profile?.name}</h1>
            <p className="profile-email">{profile?.email}</p>
            <p className="profile-bio">{profile?.bio || 'No bio yet.'}</p>
            <div className="profile-stats">
              <span><Ticket size={14} /> {bookings.length} Bookings</span>
              <span><Sparkles size={14} /> {clubs.length} Clubs</span>
              <span><Users size={14} /> {friends.length} Friends</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'profile' && <User size={16} />}
              {tab === 'bookings' && <Ticket size={16} />}
              {tab === 'clubs' && <Sparkles size={16} />}
              {tab === 'friends' && <Users size={16} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Alerts */}
        {success && <div className="alert-success">{success}</div>}
        {error && <div className="alert-error">{error}</div>}

        {/* TAB: Profile */}
        {activeTab === 'profile' && (
          <div className="tab-content glass-panel">
            <div className="tab-header">
              <h2>My Profile</h2>
              {!isEditing && (
                <button className="btn-secondary" onClick={() => setIsEditing(true)}>
                  <Edit2 size={16} /> Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form className="edit-profile-form" onSubmit={handleSaveProfile}>
                <div className="form-row">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Bio</label>
                  <textarea
                    placeholder="Tell others about yourself..."
                    value={editForm.bio}
                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary"><Save size={16} /> Save Changes</button>
                  <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}><X size={16} /> Cancel</button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <div className="detail-row"><span>Name</span><strong>{profile?.name}</strong></div>
                <div className="detail-row"><span>Email</span><strong>{profile?.email}</strong></div>
                <div className="detail-row"><span>Bio</span><strong>{profile?.bio || '—'}</strong></div>
                <div className="detail-row"><span>Login Method</span><strong>{profile?.provider || 'Email / Password'}</strong></div>
              </div>
            )}
          </div>
        )}

        {/* TAB: Bookings */}
        {activeTab === 'bookings' && (
          <div className="tab-content">
            <h2 className="tab-title">My Bookings</h2>
            {bookings.length === 0 ? (
              <div className="empty-state">
                <Film size={48} />
                <p>No bookings yet. <button className="link-btn" onClick={() => navigate('/movies')}>Browse movies →</button></p>
              </div>
            ) : (
              <div className="bookings-grid">
                {bookings.map(b => (
                  <div key={b.id} className="booking-card glass-panel">
                    <div className="booking-movie">{b.movieTitle || b.movie || 'Movie'}</div>
                    <div className="booking-meta">
                      <span><MapPin size={13} /> {b.theater || b.theatre || 'Theater'}</span>
                      <span><Calendar size={13} /> {b.date || b.showDate || 'Date TBD'}</span>
                      <span><Ticket size={13} /> {b.seats?.length || b.numSeats || 1} seat(s)</span>
                    </div>
                    <div className={`booking-status ${b.status || 'confirmed'}`}>{b.status || 'Confirmed'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Clubs */}
        {activeTab === 'clubs' && (
          <div className="tab-content">
            <h2 className="tab-title">My Clubs</h2>
            {clubs.length === 0 ? (
              <div className="empty-state">
                <Sparkles size={48} />
                <p>No clubs yet. <button className="link-btn" onClick={() => navigate('/community')}>Browse Community →</button></p>
              </div>
            ) : (
              <div className="clubs-grid-profile">
                {clubs.map(c => (
                  <div key={c.id} className="club-card-profile glass-panel" onClick={() => navigate(`/club/${c.id}`)}>
                    <div className="club-icon-profile">{c.image}</div>
                    <div>
                      <h3>{c.name}</h3>
                      <p>{c.category}</p>
                      <span className={`role-badge ${c.role}`}>{c.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Friends */}
        {activeTab === 'friends' && (
          <div className="tab-content">
            <h2 className="tab-title">Friends</h2>

            {/* Add Friend */}
            <form className="add-friend-form glass-panel" onSubmit={handleAddFriend}>
              <input
                type="email"
                placeholder="Add friend by email address..."
                value={friendEmail}
                onChange={e => setFriendEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary">
                <UserPlus size={16} /> Add Friend
              </button>
            </form>

            {friends.length === 0 ? (
              <div className="empty-state">
                <Users size={48} />
                <p>No friends added yet. Use the form above to find friends!</p>
              </div>
            ) : (
              <div className="friends-list-profile">
                {friends.map(f => (
                  <div key={f.id} className="friend-card glass-panel">
                    <div className="friend-avatar-large">{f.name?.[0]?.toUpperCase()}</div>
                    <div className="friend-info">
                      <strong>{f.name}</strong>
                      <span>{f.email}</span>
                    </div>
                    <button className="remove-friend-btn" onClick={() => handleRemoveFriend(f.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
