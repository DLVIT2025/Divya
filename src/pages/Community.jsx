import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, Play, Sparkles, Trophy, UserPlus, Heart, MessageCircle, Plus, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import './Community.css';

export default function Community() {
    const [watchParties, setWatchParties] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [movies, setMovies] = useState([]);
    const [friendActivity, setFriendActivity] = useState([]);
    const [userBadges, setUserBadges] = useState([]);
    const [joinCode, setJoinCode] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newClub, setNewClub] = useState({ name: '', description: '', category: 'General' });
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem('user')) || null;

    useEffect(() => {
        if (!user || !sessionStorage.getItem('token')) {
            navigate('/login');
            return;
        }

        const fetchCommunityData = async () => {
            try {
                const [parties, allClubs, activity, allMovies] = await Promise.all([
                    api.getWatchParties(),
                    api.getClubs(),
                    api.getFriendsActivity(user.id),
                    api.getMovies()
                ]);
                setWatchParties(parties);
                setClubs(allClubs);
                setFriendActivity(activity);
                setMovies(allMovies);
                
                // Simulate badge fetching
                const userData = await fetch(`http://localhost:3001/api/users/${user.id}`).then(r => r.json()).catch(() => ({ badges: [] }));
                setUserBadges(userData.badges || []);
            } catch (err) {
                console.error("Error fetching community data", err);
            }
        };
        fetchCommunityData();
    }, [user, navigate]);

    const handleJoinByCode = async () => {
        if (!joinCode.trim()) return;
        try {
            const res = await api.joinClubByCode(joinCode, user.id, user.name);
            alert(res.message);
            if (res.club) navigate(`/club/${res.club.id}`);
        } catch (err) {
            alert("Invalid club code or already a member");
        }
    };

    const handleCreateClub = async (e) => {
        e.preventDefault();
        try {
            const res = await api.createClub({
                ...newClub,
                userId: user.id,
                userName: user.name
            });
            alert(res.message);
            setShowCreateModal(false);
            setClubs([...clubs, res.club]);
            navigate(`/club/${res.club.id}`);
        } catch (err) {
            alert("Failed to create club");
        }
    };

    return (
        <div className="community-page animate-fade-in">
            <div className="container">
                <header className="community-hero glass-panel">
                    <div className="hero-social-info">
                        <h1>Community Hub</h1>
                        <p>Join clubs, attend watch parties, and see what your friends are watching.</p>
                        <div className="hero-actions">
                            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                                <Plus size={18} /> Create Club
                            </button>
                            <div className="join-by-code-inline">
                                <input 
                                    type="text" 
                                    placeholder="Enter Club Code..." 
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                />
                                <button onClick={handleJoinByCode}><ArrowRight size={18} /></button>
                            </div>
                        </div>
                    </div>
                    <div className="user-mini-profile">
                        <div className="badge-belt">
                            {userBadges.map((badge, i) => (
                                <div key={i} className="badge-icon" title={badge}>{badge === 'Reviewer' ? '⭐' : '🎬'}</div>
                            ))}
                            {userBadges.length === 0 && <span className="text-muted">No badges yet</span>}
                        </div>
                    </div>
                </header>

                <div className="community-grid">
                    {/* Active Watch Parties */}
                    <section className="community-section">
                        <div className="section-title">
                            <Play size={24} />
                            <h2>Active Watch Parties</h2>
                            <span className="live-badge">LIVE</span>
                        </div>
                        <div className="parties-list">
                            {watchParties.map(party => (
                                <div key={party.id} className="party-card glass-panel" onClick={() => navigate(`/party/${party.id}`)}>
                                    <div className="party-info">
                                        <h3>{party.movieTitle}</h3>
                                        <p>Hosted by <strong>{party.host}</strong></p>
                                        <div className="party-stats">
                                            <span><Users size={14} /> {party.members} watching</span>
                                        </div>
                                    </div>
                                    <button className="btn-primary">Join Party</button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Latest Movies */}
                    <section className="community-section">
                        <div className="section-title">
                            <Play size={24} />
                            <h2>Latest Additions</h2>
                        </div>
                        <div className="movies-grid">
                            {movies.map(movie => (
                                <div key={movie.id} className="movie-card glass-panel" onClick={() => navigate(`/movie/${movie.id}`)}>
                                    <img src={movie.image} alt={movie.title} className="movie-poster" />
                                    <div className="movie-info">
                                        <h4>{movie.title}</h4>
                                        <p className="movie-year">{movie.year || ''} {movie.language}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Movie Clubs */}
                    <section className="community-section">
                        <div className="section-title">
                            <Sparkles size={24} />
                            <h2>Discover Clubs</h2>
                        </div>
                        <div className="clubs-grid">
                            {clubs.map(club => (
                                <div key={club.id} className="club-card glass-panel" onClick={() => navigate(`/club/${club.id}`)}>
                                    <div className="club-icon">{club.image}</div>
                                    <div className="club-details">
                                        <h3>{club.name}</h3>
                                        <p className="club-cat">{club.category}</p>
                                        <p className="club-members">{club.members} Members</p>
                                    </div>
                                    <button className="btn-secondary join-club-btn">Join</button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Friends Activity & Badges */}
                    <aside className="community-sidebar">
                        <div className="sidebar-card glass-panel">
                            <h3><Trophy size={18} /> My Badges</h3>
                            <div className="badges-list">
                                {userBadges.map((badge, idx) => (
                                    <div key={idx} className="badge-item platinum" title={badge}>
                                        {badge === 'Early Bird' ? '🌅' : badge === 'Reviewer' ? '✍️' : '🎬'}
                                    </div>
                                ))}
                                {userBadges.length === 0 && <p className="text-muted">Earn badges by reviewing & watching!</p>}
                            </div>
                        </div>

                        <div className="sidebar-card glass-panel mt-4">
                            <h3><UserPlus size={18} /> Friend's Tracker</h3>
                            <div className="friends-list">
                                {friendActivity.length > 0 ? friendActivity.map(act => (
                                    <div key={act.id} className="friend-activity">
                                        <div className="friend-avatar">{act.userName ? act.userName[0] : '?'}</div>
                                        <div className="activity-content">
                                            <div className="activity-text">
                                                <strong>{act.userName}</strong> {act.type === 'WATCHED' ? 'watched' : 'is interested in'} <em>{act.movieTitle}</em>
                                                <p className="mini-comment">"{act.text}"</p>
                                            </div>
                                            <div className="activity-actions">
                                                <button className="mini-btn"><Heart size={12} /> 2</button>
                                                <button className="mini-btn"><MessageCircle size={12} /> Reply</button>
                                            </div>
                                        </div>
                                    </div>
                                )) : <p className="text-muted">No recent friend activity.</p>}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Create Club Modal */}
            {showCreateModal && (
                <div className="modal-overlay animate-fade-in" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content glass-panel animate-slide-up" onClick={e => e.stopPropagation()}>
                        <h2>🎬 Create Your Movie Club</h2>
                        <form onSubmit={handleCreateClub}>
                            <div className="form-group">
                                <label>Club Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Bollywood Lovers"
                                    value={newClub.name}
                                    onChange={e => setNewClub({...newClub, name: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={newClub.category}
                                    onChange={e => setNewClub({...newClub, category: e.target.value})}
                                >
                                    <option value="General">General</option>
                                    <option value="Action">Action</option>
                                    <option value="Romance">Romance</option>
                                    <option value="Sci-Fi">Sci-Fi</option>
                                    <option value="Horror">Horror</option>
                                    <option value="Comedy">Comedy</option>
                                    <option value="Thriller">Thriller</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description (Optional)</label>
                                <textarea
                                    placeholder="What is this club about?"
                                    value={newClub.description}
                                    onChange={e => setNewClub({...newClub, description: e.target.value})}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">🚀 Launch Club</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
