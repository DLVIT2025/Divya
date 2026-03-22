import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Film, Coffee, ShieldAlert, LogOut, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('movies');
    const [localBevs, setLocalBevs] = useState([]);
    const [localMovies, setLocalMovies] = useState([]);
    const [editingMovie, setEditingMovie] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const isAdmin = sessionStorage.getItem('isAdmin');
        if (!isAdmin) {
            navigate('/admin');
            return;
        }

        const fetchData = async () => {
          const [moviesData, bevsData] = await Promise.all([
            api.getMovies(),
            api.getBeverages()
          ]);
          setLocalMovies(moviesData);
          setLocalBevs(bevsData);
        };
        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem('isAdmin');
        navigate('/admin');
    };

    const saveBeverageChanges = async () => {
        await api.updateBeverages(localBevs);
        setSuccessMsg('Add-ons catalog updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleMovieEdit = (movie) => {
        setEditingMovie({ ...movie });
    };

    const handleMovieSave = async () => {
        if (editingMovie.id) {
            const updated = await api.updateMovie(editingMovie.id, editingMovie);
            setLocalMovies(localMovies.map(m => m.id === editingMovie.id ? updated : m));
        } else {
            const added = await api.addMovie(editingMovie);
            setLocalMovies([...localMovies, added]);
        }
        setEditingMovie(null);
        setSuccessMsg('Movie inventory updated!');
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleMovieDelete = async (id) => {
        if (window.confirm('Delete this movie?')) {
            await api.deleteMovie(id);
            setLocalMovies(localMovies.filter(m => m.id !== id));
        }
    };

    return (
        <div className="admin-dash animate-fade-in">
            <aside className="admin-sidebar glass-panel">
                <div className="admin-brand">
                    <Settings size={28} className="admin-icon-main" />
                    <h2>Admin Center</h2>
                </div>

                <nav className="admin-nav">
                    <button
                        className={`admin-nav-item ${activeTab === 'movies' ? 'active' : ''}`}
                        onClick={() => setActiveTab('movies')}
                    >
                        <Film size={20} /> Movie Inventory
                    </button>

                    <button
                        className={`admin-nav-item ${activeTab === 'beverages' ? 'active' : ''}`}
                        onClick={() => setActiveTab('beverages')}
                    >
                        <Coffee size={20} /> Add-ons & Prices
                    </button>

                    <button className="admin-nav-item" onClick={() => alert("Theater configuration demo Coming Soon")}>
                        <ShieldAlert size={20} /> Theater Settings
                    </button>
                </nav>

                <div className="admin-logout">
                    <button className="btn-secondary w-100 logout-btn" onClick={handleLogout}>
                        <LogOut size={18} /> Exit Admin
                    </button>
                </div>
            </aside>

            <main className="admin-content">
                <div className="admin-header glass-panel">
                    <h1>System Configuration</h1>
                    <div className="admin-badge">Admin Access: {sessionStorage.getItem('isAdmin') === 'true' ? 'Verified' : 'Unauthorized'}</div>
                </div>

                {successMsg && (
                    <div className="success-banner">
                        <CheckCircle size={20} /> {successMsg}
                    </div>
                )}

                {activeTab === 'movies' && (
                    <div className="admin-card glass-panel">
                        <div className="card-heading">
                            <h2>Movie Inventory</h2>
                            <button className="btn-primary" onClick={() => setEditingMovie({ title: '', genre: '', rating: '8.0/10', language: '', image: '', trailer: '', synopsis: '' })}>
                                Add New Movie
                            </button>
                        </div>

                        {editingMovie ? (
                            <div className="movie-edit-form glass-panel">
                                <h3>{editingMovie.id ? 'Edit Movie' : 'Add Movie'}</h3>
                                <div className="form-grid">
                                    <input type="text" placeholder="Title" value={editingMovie.title} onChange={e => setEditingMovie({ ...editingMovie, title: e.target.value })} />
                                    <input type="text" placeholder="Genre" value={editingMovie.genre} onChange={e => setEditingMovie({ ...editingMovie, genre: e.target.value })} />
                                    <input type="text" placeholder="Language" value={editingMovie.language} onChange={e => setEditingMovie({ ...editingMovie, language: e.target.value })} />
                                    <input type="text" placeholder="Rating" value={editingMovie.rating} onChange={e => setEditingMovie({ ...editingMovie, rating: e.target.value })} />
                                    <input type="text" placeholder="Poster URL" value={editingMovie.image} onChange={e => setEditingMovie({ ...editingMovie, image: e.target.value })} />
                                    <input type="text" placeholder="Trailer URL" value={editingMovie.trailer} onChange={e => setEditingMovie({ ...editingMovie, trailer: e.target.value })} />
                                    <textarea placeholder="Synopsis" value={editingMovie.synopsis} onChange={e => setEditingMovie({ ...editingMovie, synopsis: e.target.value })} />
                                </div>
                                <div className="form-actions">
                                    <button className="btn-primary" onClick={handleMovieSave}>Save Movie</button>
                                    <button className="btn-secondary" onClick={() => setEditingMovie(null)}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Poster</th>
                                            <th>Title</th>
                                            <th>Genre</th>
                                            <th>Rating</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {localMovies.map(movie => (
                                            <tr key={movie.id}>
                                                <td><img src={movie.image} className="admin-table-img" alt="" /></td>
                                                <td>{movie.title}</td>
                                                <td>{movie.genre}</td>
                                                <td>{movie.rating}</td>
                                                <td>
                                                    <button className="btn-secondary" onClick={() => handleMovieEdit(movie)}>Edit</button>
                                                    <button className="btn-secondary" style={{ color: '#ff4757', marginLeft: '8px' }} onClick={() => handleMovieDelete(movie.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'beverages' && (
                    <div className="admin-card glass-panel">
                        <div className="card-heading">
                            <h2>Manage Concessions pricing</h2>
                            <button className="btn-primary admin-save-btn" onClick={saveBeverageChanges}>
                                Save Changes
                            </button>
                        </div>

                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Icon</th>
                                        <th>Item Name</th>
                                        <th>Current Price (Rs)</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {localBevs.map(bev => (
                                        <tr key={bev.id}>
                                            <td style={{ fontSize: '24px' }}>{bev.image}</td>
                                            <td>{bev.name}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={bev.price}
                                                    className="admin-input"
                                                    onChange={(e) => {
                                                        const updated = localBevs.map(b => b.id === bev.id ? { ...b, price: Number(e.target.value) } : b);
                                                        setLocalBevs(updated);
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <button className="btn-secondary" style={{ padding: '6px 12px' }}>Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
