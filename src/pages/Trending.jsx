import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Star } from 'lucide-react';
import { api } from '../services/api';
import './Movies.css'; // Reuse styles

export default function Trending() {
    const [movies, setMovies] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMovies = async () => {
            const data = await api.getMovies();
            // Mock trending: sort by rating
            const trending = data.sort((a, b) => b.rating - a.rating).slice(0, 10);
            setMovies(trending);
        };
        fetchMovies();
    }, []);

    return (
        <div className="movies-page animate-fade-in">
            <div className="container">
                <div className="page-header">
                    <h1><TrendingUp size={32} /> Trending Movies</h1>
                    <p>Most popular movies this week</p>
                </div>

                <div className="movie-grid">
                    {movies.map(movie => (
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
            </div>
        </div>
    );
}