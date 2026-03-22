import { useState, useEffect } from 'react';
import { Star, Send, MessageSquare, Award, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';
import './Reviews.css';

function SpoilerReview({ text }) {
    const [revealed, setRevealed] = useState(false);

    return (
        <div className="spoiler-review">
            {revealed ? (
                <p className="review-text">{text}</p>
            ) : (
                <p className="spoiler-text">⚠️ This review contains spoilers</p>
            )}
            <button onClick={() => setRevealed(!revealed)} className="spoiler-toggle">
                {revealed ? <EyeOff size={14} /> : <Eye size={14} />} {revealed ? 'Hide' : 'Show'} Spoilers
            </button>
        </div>
    );
}

export default function Reviews({ movieId }) {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [spoiler, setSpoiler] = useState(false);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user')) || { id: 1, name: 'Guest' };

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await api.getReviews(movieId);
                setReviews(data);
            } catch (err) {
                console.error("Reviews fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [movieId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            const newReview = await api.postReview({
                movieId,
                userId: user.id,
                userName: user.name,
                rating,
                comment,
                spoiler
            });
            setReviews([newReview, ...reviews]);
            setComment('');
            setRating(5);
            setSpoiler(false);
            alert("Review posted! You're one step closer to the 'Critic' badge.");
        } catch (err) {
            alert("Failed to post review");
        }
    };

    if (loading) return <div>Loading reviews...</div>;

    return (
        <div className="reviews-container glass-panel">
            <div className="reviews-header">
                <h2><MessageSquare size={20} /> User Reviews</h2>
            </div>

            <form className="review-form" onSubmit={handleSubmit}>
                <div className="rating-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                            key={star}
                            size={24}
                            fill={star <= rating ? "#ffd700" : "none"}
                            color={star <= rating ? "#ffd700" : "#666"}
                            onClick={() => setRating(star)}
                            style={{ cursor: 'pointer' }}
                        />
                    ))}
                </div>
                <textarea 
                    placeholder="Write your review here..." 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <label>
                    <input type="checkbox" checked={spoiler} onChange={(e) => setSpoiler(e.target.checked)} />
                    Mark as spoiler
                </label>
                <button type="submit" className="btn-primary">
                    <Send size={16} /> Post Review
                </button>
            </form>

            <div className="reviews-list">
                {reviews.length > 0 ? reviews.map(r => (
                    <div key={r.id} className="review-item">
                        <div className="review-user-row">
                            <div className="review-avatar">{r.userName[0]}</div>
                            <div className="review-meta">
                                <strong>{r.userName}</strong>
                                <div className="stars">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={12} fill={i < r.rating ? "#ffd700" : "none"} color={i < r.rating ? "#ffd700" : "#666"} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        {r.spoiler ? (
                            <SpoilerReview text={r.comment} />
                        ) : (
                            <p className="review-text">{r.comment}</p>
                        )}
                    </div>
                )) : <p className="text-muted">No reviews yet. Be the first to review!</p>}
            </div>
            
            <div className="gamification-nudge">
                <Award size={18} />
                <span>Write 5 reviews to earn the <strong>Reviewer</strong> badge!</span>
            </div>
        </div>
    );
}
