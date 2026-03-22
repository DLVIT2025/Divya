import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Calendar, Clock, Star, Users } from 'lucide-react';
import { api } from '../services/api';
import { showtimes } from '../data/mockData';
import Reviews from '../components/Reviews';
import './MovieDetail.css';

export default function MovieDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovie = async () => {
          const moviesData = await api.getMovies();
          const found = moviesData.find(m => m.id === parseInt(id));
          setMovie(found);
          setLoading(false);
        };
        fetchMovie();
    }, [id]);

    if (loading) return <div className="container" style={{ paddingTop: '100px' }}>Loading movie details...</div>;
    if (!movie) return <div className="container" style={{ paddingTop: '100px' }}>Movie not found</div>;

    const handleShowtimeSelect = (time) => {
        navigate(`/seats/${movie.id}?time=${encodeURIComponent(time)}`);
    };

    return (
        <div className="movie-detail-page animate-fade-in">
            <div className="backdrop" style={{ backgroundImage: `url(${movie.image})` }}>
                <div className="backdrop-overlay"></div>
            </div>

            <div className="container content-container">
                <div className="detail-grid">
                    <div className="poster-col">
                        <img src={movie.image} alt={movie.title} className="detail-poster" />
                        <button 
                            className="btn-secondary w-100 mt-4 outline-btn"
                            onClick={() => movie.trailer && window.open(movie.trailer, '_blank')}
                            disabled={!movie.trailer}
                        >
                            <Play size={20} /> {movie.trailer ? 'Watch Trailer' : 'Trailer Unavailable'}
                        </button>
                    </div>

                    <div className="info-col">
                        <div className="title-area">
                            <h1>{movie.title}</h1>
                            <div className="ai-match-badge large-badge">{movie.aiMatch}% AI Match</div>
                        </div>

                        <div className="meta-info">
                            <span className="meta-item"><Users size={18} /> {movie.language}</span>
                            <span className="meta-item"><Clock size={18} /> {movie.duration}</span>
                            <span className="meta-item"><Star size={18} fill="#ffd700" color="#ffd700" /> {movie.rating}</span>
                        </div>

                        <p className="synopsis">{movie.synopsis}</p>
                        <p className="genre"><strong>Genre:</strong> {movie.genre}</p>

                        {movie.cast && movie.cast.length > 0 && (
                            <div className="cast-section">
                                <h3>Cast</h3>
                                <div className="cast-grid">
                                    {movie.cast.map((actor, idx) => (
                                        <div key={idx} className="cast-card">
                                            <img src={actor.image} alt={actor.name} className="cast-img" loading="lazy" />
                                            <div className="cast-info">
                                                <p className="cast-name">{actor.name}</p>
                                                <p className="cast-role">{actor.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="booking-section glass-panel">
                            <h3>Select Showtime</h3>
                            <p className="booking-subtitle">Today, {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>

                            <div className="showtimes-grid">
                                {showtimes.map((time, index) => (
                                    <button
                                        key={index}
                                        className="time-slot"
                                        onClick={() => handleShowtimeSelect(time)}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Reviews Section */}
                <Reviews movieId={movie.id} />
            </div>
        </div>
    );
}
