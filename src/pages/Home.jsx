import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, Search, Play, Star, Sparkles, Ticket } from 'lucide-react';
import { api } from '../services/api';
import './Home.css';

export default function Home() {
    const [isListening, setIsListening] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [moviesList, setMoviesList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMovies = async () => {
            const data = await api.getMovies();
            setMoviesList(data);
        };
        fetchMovies();
    }, []);

    // Voice Search Mock
    const handleVoiceSearch = () => {
        setIsListening(true);
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setSearchQuery(transcript);
                setIsListening(false);
            };
            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);
            recognition.start();
        } else {
            setTimeout(() => {
                const mockSearches = ["Tamil", "Action", "Telugu", "RRR", "Leo", "Hindi"];
                const randomSearch = mockSearches[Math.floor(Math.random() * mockSearches.length)];
                setSearchQuery(randomSearch);
                setIsListening(false);
            }, 1500);
        }
    };

    const lowerQuery = searchQuery.toLowerCase().trim();
    const filteredMovies = moviesList.filter(m => {
        if (!lowerQuery) return true;
        return (
            m.title.toLowerCase().includes(lowerQuery) ||
            m.genre.toLowerCase().includes(lowerQuery) ||
            m.language.toLowerCase().includes(lowerQuery) ||
            m.synopsis.toLowerCase().includes(lowerQuery)
        );
    });

    const aiRecommended = [...moviesList].sort((a, b) => (b.aiMatch || 0) - (a.aiMatch || 0)).slice(0, 3);
    const heroMovie = moviesList[0];

    if (moviesList.length === 0) return <div className="loading-screen container">Loading movies...</div>;

    return (
        <div className="home-page animate-fade-in">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg" style={{ backgroundImage: `url(${heroMovie.image})` }} />
                <div className="hero-overlay" />
                <div className="container hero-content">
                    <div className="ai-badge hero-badge"><Sparkles size={14} /> AI Top Pick</div>
                    <h1 className="hero-title">{heroMovie.title}</h1>
                    <p className="hero-meta">{heroMovie.genre} • {heroMovie.duration}</p>
                    <p className="hero-synopsis">{heroMovie.synopsis}</p>
                    <div className="hero-actions">
                        <Link to={`/movie/${heroMovie.id}`} className="btn-primary hero-btn">
                            <Ticket size={20} /> Book Tickets
                        </Link>
                        <button 
                            className="btn-secondary hero-btn"
                            onClick={() => heroMovie.trailer && window.open(heroMovie.trailer, '_blank')}
                            disabled={!heroMovie.trailer}
                        >
                            <Play size={20} /> {heroMovie.trailer ? 'Watch Trailer' : 'Trailer Unavailable'}
                        </button>
                    </div>
                </div>
            </section>

            {/* Voice Search Bar */}
            <section className="search-section container">
                <div className="search-bar glass-panel">
                    <Search className="search-icon" size={24} />
                    <input
                        type="text"
                        placeholder="Search for movies, genres, or actors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        className={`mic-btn ${isListening ? 'listening' : ''}`}
                        onClick={handleVoiceSearch}
                        title={isListening ? "Listening..." : "Search by Voice"}
                    >
                        <Mic size={24} />
                    </button>
                </div>
            </section>

            {/* Recommended Movies (AI) */}
            <section className="movies-section container">
                <div className="section-header">
                    <h2><Sparkles className="ai-icon" size={28} /> AI Recommended For You</h2>
                    <p className="subtitle">Based on your viewing history and preferences</p>
                </div>
                <div className="movie-grid">
                    {aiRecommended.map(movie => (
                        <div key={`ai-${movie.id}`} className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
                            <div className="movie-poster">
                                <img src={movie.image} alt={movie.title} loading="lazy" />
                                <div className="ai-match-badge">{movie.aiMatch}% Match</div>
                            </div>
                            <div className="movie-info">
                                <h3>{movie.title}</h3>
                                <div className="movie-stats">
                                    <span>{movie.genre}</span>
                                    <span className="rating"><Star size={14} fill="currentColor" /> {movie.rating}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* All Now Showing */}
            <section className="movies-section container" style={{ marginTop: '60px' }}>
                <div className="section-header">
                    <h2>Now Showing</h2>
                </div>
                <div className="movie-grid">
                    {filteredMovies.map(movie => (
                        <div key={movie.id} className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
                            <div className="movie-poster">
                                <img src={movie.image} alt={movie.title} loading="lazy" />
                            </div>
                            <div className="movie-info">
                                <h3>{movie.title}</h3>
                                <div className="movie-stats">
                                    <span>{movie.genre}</span>
                                    <span className="rating"><Star size={14} fill="currentColor" /> {movie.rating}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {filteredMovies.length === 0 && (
                    <div className="no-results">No movies found mapping your search.</div>
                )}
            </section>
        </div>
    );
}
