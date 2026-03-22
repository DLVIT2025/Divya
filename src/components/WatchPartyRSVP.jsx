import { useState } from 'react';
import { Users, Check, X, MessageSquare, Share2 } from 'lucide-react';
import './WatchPartyRSVP.css';

export default function WatchPartyRSVP({ partyId, party = {} }) {
  const [rsvpStatus, setRsvpStatus] = useState('pending');
  const [attendees, setAttendees] = useState(party.attendees || []);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const user = JSON.parse(localStorage.getItem('user')) || { id: 1, name: 'Guest' };

  const handleRSVP = (status) => {
    setRsvpStatus(status);
    if (status === 'attending') {
      setAttendees([...attendees, user.name]);
    } else if (status === 'not-attending') {
      setAttendees(attendees.filter(a => a !== user.name));
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const message = {
      id: Date.now(),
      user: user.name,
      text: chatInput,
      timestamp: new Date()
    };

    setChatMessages([...chatMessages, message]);
    setChatInput('');
  };

  return (
    <div className="watch-party-rsvp">
      <div className="rsvp-card glass-panel">
        <h3>Watch Party Details</h3>
        
        <div className="party-info">
          <div className="info-item">
            <span className="label">Movie</span>
            <span className="value">{party.movieTitle || 'TBA'}</span>
          </div>
          <div className="info-item">
            <span className="label">Date & Time</span>
            <span className="value">
              {party.date ? new Date(party.date).toLocaleString() : 'TBA'}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Location</span>
            <span className="value">{party.location || 'TBA'}</span>
          </div>
        </div>

        <div className="rsvp-buttons">
          <button 
            className={`rsvp-btn attending ${rsvpStatus === 'attending' ? 'active' : ''}`}
            onClick={() => handleRSVP('attending')}
          >
            <Check size={16} /> I'm Attending
          </button>
          <button 
            className={`rsvp-btn pending ${rsvpStatus === 'pending' ? 'active' : ''}`}
            onClick={() => handleRSVP('pending')}
          >
            Maybe
          </button>
          <button 
            className={`rsvp-btn not-attending ${rsvpStatus === 'not-attending' ? 'active' : ''}`}
            onClick={() => handleRSVP('not-attending')}
          >
            <X size={16} /> Can't Attend
          </button>
        </div>
      </div>

      <div className="attendees-section glass-panel">
        <h3><Users size={18} /> Attendees ({attendees.length})</h3>
        <div className="attendees-grid">
          {attendees.length === 0 ? (
            <p className="no-attendees">Be the first to join!</p>
          ) : (
            attendees.map((attendee, idx) => (
              <div key={idx} className="attendee-badge">
                <div className="avatar">{attendee[0]}</div>
                <span>{attendee}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="party-chat glass-panel">
        <h3><MessageSquare size={18} /> Party Chat</h3>
        
        <div className="chat-messages">
          {chatMessages.length === 0 ? (
            <div className="no-messages">No messages yet. Start the conversation!</div>
          ) : (
            chatMessages.map(msg => (
              <div key={msg.id} className="chat-message">
                <div className="message-meta">
                  <strong>{msg.user}</strong>
                  <span className="timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="message-text">{msg.text}</p>
              </div>
            ))
          )}
        </div>

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Say something about the movie..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <button type="submit" className="send-btn">Send</button>
        </form>
      </div>

      <button className="share-party-btn">
        <Share2 size={16} /> Share Party
      </button>
    </div>
  );
}
