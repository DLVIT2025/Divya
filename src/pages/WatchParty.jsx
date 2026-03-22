import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Send, Users, Play, Info } from 'lucide-react';
import { api } from '../services/api';
import WatchPartyRSVP from '../components/WatchPartyRSVP';
import './WatchParty.css';

export default function WatchParty() {
    const { id } = useParams();
    const [party, setParty] = useState(null);
    const [messages, setMessages] = useState([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [newMsg, setNewMsg] = useState('');
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem('user')) || { id: 1, name: 'Guest' };

    useEffect(() => {
        const fetchPartyData = async () => {
            try {
                const parties = await api.getParties();
                const found = parties.find(p => p.id === parseInt(id)) || parties[0];
                setParty(found);
                
                // Fetch real messages if they exist
                const response = await fetch(`http://localhost:3001/api/community/messages?partyId=${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setMessages(data);
                }
            } catch (err) {
                console.error("Party fetch failed", err);
            }
        };
        fetchPartyData();

        // Refresh messages every 3 seconds for "real-time" feel
        const interval = setInterval(fetchPartyData, 3000);
        return () => clearInterval(interval);
    }, [id]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMsg.trim()) return;
        
        const msg = { partyId: parseInt(id), user: user.name, text: newMsg, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
        
        try {
            await fetch('http://localhost:3001/api/community/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msg)
            });
            setMessages([...messages, msg]);
            setNewMsg('');
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    if (!party) return <div className="container" style={{paddingTop: '100px'}}>Loading Party...</div>;

    return (
        <div className="watch-party-page animate-fade-in">
            <div className="party-container">
                <main className="video-section">
                    <div className="video-player-mock glass-panel">
                        <div className="player-overlay">
                            <Play size={80} />
                            <p>Synchronized Playback Active</p>
                        </div>
                        <div className="player-controls">
                            <div className="progress-bar"></div>
                            <div className="controls-row">
                                <span className="time">14:52 / 2:45:00</span>
                                <div className="status-indicator"><div className="status-dot"></div> SYNCED</div>
                            </div>
                        </div>
                    </div>
                    <div className="party-details">
                        <div className="party-title-row">
                            <h1>{party.movieTitle} <span className="badge">Watch Party</span></h1>
                            <button className="btn-secondary" onClick={() => setShowInviteModal(true)}>+ Invite Friends</button>
                        </div>
                        <p><Users size={16} /> Hosted by <strong>{party.host}</strong> • {party.members} friends watching</p>
                    </div>

                    <div className="party-rsvp-section">
                        <WatchPartyRSVP partyId={id} party={party} />
                    </div>
                </main>

                {/* Invite Modal */}
                {showInviteModal && (
                    <div className="search-overlay animate-fade-in" onClick={() => setShowInviteModal(false)}>
                        <div className="search-modal invite-modal" onClick={e => e.stopPropagation()}>
                            <div className="chat-header"><h3>Invite Friends</h3></div>
                            <div className="invite-friends-list">
                                <div className="friend-invite-item">
                                    <div className="friend-avatar">JD</div>
                                    <span>John Doe</span>
                                    <button className="btn-primary mini-btn" onClick={() => {alert("Invite Sent!"); setShowInviteModal(false)}}>Invite</button>
                                </div>
                                <div className="friend-invite-item mt-3">
                                    <div className="friend-avatar">SA</div>
                                    <span>Sarah Admin</span>
                                    <button className="btn-primary mini-btn" onClick={() => {alert("Invite Sent!"); setShowInviteModal(false)}}>Invite</button>
                                </div>
                            </div>
                            <button className="btn-secondary mt-4 w-100" onClick={() => setShowInviteModal(false)}>Close</button>
                        </div>
                    </div>
                )}

                <aside className="chat-section glass-panel">
                    <div className="chat-header">
                        <h3><MessageSquare size={18} /> Group Chat</h3>
                    </div>
                    <div className="chat-messages">
                        {messages.map((m, idx) => (
                            <div key={idx} className={`chat-bubble ${m.user === 'Me' ? 'self' : ''}`}>
                                <span className="chat-user">{m.user}</span>
                                <p className="chat-text">{m.text}</p>
                            </div>
                        ))}
                    </div>
                    <form className="chat-input" onSubmit={handleSendMessage}>
                        <input 
                            type="text" 
                            placeholder="Type a message..." 
                            value={newMsg}
                            onChange={(e) => setNewMsg(e.target.value)}
                        />
                        <button type="submit" className="send-btn"><Send size={18} /></button>
                    </form>
                </aside>
            </div>
        </div>
    );
}
