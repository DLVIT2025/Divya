import { useState } from 'react';
import { Check, BarChart3 } from 'lucide-react';
import './PollVoter.css';

export default function PollVoter({ poll, onVote, userVotes = {} }) {
  const [selectedVotes, setSelectedVotes] = useState(userVotes);
  const [hasVoted, setHasVoted] = useState(Object.keys(userVotes).length > 0);

  const handleVote = (category, option) => {
    setSelectedVotes(prev => ({
      ...prev,
      [category]: option
    }));
  };

  const handleSubmitVote = () => {
    if (Object.keys(selectedVotes).length === 0) {
      alert('Please select at least one option');
      return;
    }
    onVote(poll.id, selectedVotes);
    setHasVoted(true);
  };

  const getVoteCount = (category, option) => {
    if (!poll.votes || !poll.votes[category]) return 0;
    return poll.votes[category][option] || 0;
  };

  const getTotalVotes = (category) => {
    if (!poll.votes || !poll.votes[category]) return 0;
    return Object.values(poll.votes[category]).reduce((a, b) => a + b, 0);
  };

  const getPercentage = (category, option) => {
    const total = getTotalVotes(category);
    if (total === 0) return 0;
    return Math.round((getVoteCount(category, option) / total) * 100);
  };

  return (
    <div className="poll-voter-container">
      <div className="poll-header">
        <h3>Cast Your Vote</h3>
        <span className="vote-status">{hasVoted ? '✓ Voted' : 'Not voted'}</span>
      </div>

      {poll.movieOptions && (
        <div className="poll-category">
          <h4>Which movie?</h4>
          <div className="poll-options">
            {poll.movieOptions.map(movie => (
              <div key={movie} className="poll-option-item">
                <button
                  className={`option-button ${selectedVotes.movie === movie ? 'selected' : ''} ${hasVoted ? 'disabled' : ''}`}
                  onClick={() => !hasVoted && handleVote('movie', movie)}
                  disabled={hasVoted}
                >
                  <span className="option-label">{movie}</span>
                  <div className="vote-bar">
                    <div 
                      className="vote-fill" 
                      style={{ width: `${getPercentage('movie', movie)}%` }}
                    ></div>
                  </div>
                  <span className="vote-count">{getVoteCount('movie', movie)} votes ({getPercentage('movie', movie)}%)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {poll.theatreOptions && (
        <div className="poll-category">
          <h4>Which theater?</h4>
          <div className="poll-options">
            {poll.theatreOptions.map(theatre => (
              <div key={theatre} className="poll-option-item">
                <button
                  className={`option-button ${selectedVotes.theatre === theatre ? 'selected' : ''} ${hasVoted ? 'disabled' : ''}`}
                  onClick={() => !hasVoted && handleVote('theatre', theatre)}
                  disabled={hasVoted}
                >
                  <span className="option-label">{theatre}</span>
                  <div className="vote-bar">
                    <div 
                      className="vote-fill" 
                      style={{ width: `${getPercentage('theatre', theatre)}%` }}
                    ></div>
                  </div>
                  <span className="vote-count">{getVoteCount('theatre', theatre)} votes ({getPercentage('theatre', theatre)}%)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {poll.timeOptions && (
        <div className="poll-category">
          <h4>What time?</h4>
          <div className="poll-options">
            {poll.timeOptions.map(time => (
              <div key={time} className="poll-option-item">
                <button
                  className={`option-button ${selectedVotes.time === time ? 'selected' : ''} ${hasVoted ? 'disabled' : ''}`}
                  onClick={() => !hasVoted && handleVote('time', time)}
                  disabled={hasVoted}
                >
                  <span className="option-label">{time}</span>
                  <div className="vote-bar">
                    <div 
                      className="vote-fill" 
                      style={{ width: `${getPercentage('time', time)}%` }}
                    ></div>
                  </div>
                  <span className="vote-count">{getVoteCount('time', time)} votes ({getPercentage('time', time)}%)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasVoted && (
        <button className="btn-primary submit-vote-btn" onClick={handleSubmitVote}>
          <Check size={18} /> Submit Vote
        </button>
      )}

      {hasVoted && Object.keys(selectedVotes).length > 0 && (
        <div className="your-votes">
          <h4><BarChart3 size={16} /> Your choices:</h4>
          <ul>
            {selectedVotes.movie && <li>Movie: <strong>{selectedVotes.movie}</strong></li>}
            {selectedVotes.theatre && <li>Theatre: <strong>{selectedVotes.theatre}</strong></li>}
            {selectedVotes.time && <li>Time: <strong>{selectedVotes.time}</strong></li>}
          </ul>
        </div>
      )}
    </div>
  );
}
