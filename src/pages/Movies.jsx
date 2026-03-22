import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, X, Star } from 'lucide-react';
import { api } from '../services/api';
import './Movies.css';

export default function Movies() {
    const [activeLang, setActiveLang] = useState('All');
    const [activeGenre, setActiveGenre] = useState('All');
    const [moviesList, setMoviesList] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const languages = ['All', 'English', 'Tamil', 'Telugu', 'Hindi', 'Malayalam', 'Kannada'];
    const genres = ['All', 'Action', 'Sci-Fi', 'Drama', 'Comedy', 'Thriller'];

    useEffect(() => {
        const fetchMovies = async () => {
            const data = await api.getMovies();
            setMoviesList(data);
            setFiltered(data);
        };
        fetchMovies();
    }, []);

    useEffect(() => {
        let result = moviesList;
        const searchTerm = searchParams.get('search')?.toLowerCase() || '';

        if (searchTerm) {
            result = result.filter(m => 
                m.title.toLowerCase().includes(searchTerm) || 
                m.language.toLowerCase().includes(searchTerm) ||
                m.genre.toLowerCase().includes(searchTerm)
            );
        }

        if (activeLang !== 'All') {
            result = result.filter(m => m.language.includes(activeLang));
        }
        if (activeGenre !== 'All') {
            result = result.filter(m => m.genre.includes(activeGenre));
        }
        setFiltered(result);
    }, [activeLang, activeGenre, searchParams, moviesList]);

    return (
        <div className="movies-page animate-fade-in">
            {/* Filters Sidebar area (desktop) / Top bar (mobile) */}
            <div className="container movies-layout">
                <aside className="filters-sidebar glass-panel">
                    <h3>Filters</h3>

                    <div className="filter-group">
                        <h4>Language</h4>
                        <div className="filter-options">
                            {languages.map(lang => (
                                <button
                                    key={lang}
                                    className={`filter-btn ${activeLang === lang ? 'active' : ''}`}
                                    onClick={() => setActiveLang(lang)}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <h4>Genre</h4>
                        <div className="filter-options">
                            {genres.map(genre => (
                                <button
                                    key={genre}
                                    className={`filter-btn ${activeGenre === genre ? 'active' : ''}`}
                                    onClick={() => setActiveGenre(genre)}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                <main className="movies-results">
                    <div className="results-header">
                        <h2>Movies in Theatres</h2>
                        <p className="text-muted">{filtered.length} Movies Available</p>
                    </div>

                    <div className="movie-grid">
                        {filtered.map(movie => (
                            <div key={movie.id} className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
                                <div className="movie-poster">
                                    <img src={movie.image} alt={movie.title} loading="lazy" />
                                    <div className="ai-match-badge">{movie.aiMatch}% Match</div>
                                </div>
                                <div className="movie-info">
                                    <h3>{movie.title}</h3>
                                    <div className="movie-stats">
                                        <span className="movie-lang">{movie.language.split(',')[0]}</span>
                                        <span className="rating"><Star size={14} fill="#ffd700" color="#ffd700" /> {movie.rating}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="no-results glass-panel">
                            <Search size={40} className="text-muted" style={{ margin: '0 auto 16px' }} />
                            <h3>No movies found</h3>
                            <p>Try adjusting your filters</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
