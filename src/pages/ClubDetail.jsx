import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageSquare, Send, Users, ArrowLeft, ArrowRight, Calendar, Settings, X } from 'lucide-react';
import { api } from '../services/api';
import PollVoter from '../components/PollVoter';
import MovieTimeline from '../components/MovieTimeline';
import ClubLeaderboard from '../components/ClubLeaderboard';
import './ClubDetail.css';

export default function ClubDetail() {
    const { id } = useParams();
    const [club, setClub] = useState(null);
    const [discussions, setDiscussions] = useState([]);
    const [members, setMembers] = useState([]);
    const [membership, setMembership] = useState(null); 
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', description: '' });
    const [joinCode, setJoinCode] = useState('');
    const [newPost, setNewPost] = useState('');
    const [loading, setLoading] = useState(true);
    const [polls, setPolls] = useState([]);
    const [showPollCreator, setShowPollCreator] = useState(false);
    const [timelines, setTimelines] = useState([]);
    const [userVotes, setUserVotes] = useState({});
    const user = JSON.parse(localStorage.getItem('user')) || { id: 1, name: 'Guest' };

    const fetchClubData = async () => {
        try {
            const [clubs, allMembers, clubPolls] = await Promise.all([
                api.getClubs(),
                api.getClubMembers(id),
                api.getPolls(id)
            ]);
            
            const found = clubs.find(c => c.id === parseInt(id));
            setClub(found);
            setEditForm({ name: found.name, description: found.description || '' });
            setMembers(allMembers);
            setPolls(clubPolls);
            
            // Check membership
            const member = allMembers.find(m => m.userId === user.id);
            setMembership(member ? member.role : null);

            if (member) {
                const posts = await api.getClubDiscussions(id);
                setDiscussions(posts);
            }
        } catch (err) {
            console.error("Error fetching club data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClubData();
    }, [id, user.id]);

    const handleJoinByCode = async () => {
        try {
            const res = await api.joinClubByCode(joinCode, user.id, user.name);
            alert(res.message);
            fetchClubData();
        } catch (err) {
            alert("Invalid code or already joined");
        }
    };

    const handleEditClub = async (e) => {
        e.preventDefault();
        try {
            await api.updateClub(id, { ...editForm, adminId: user.id });
            setClub({ ...club, ...editForm });
            setIsEditing(false);
            alert("Club updated!");
        } catch (err) {
            alert("Failed to update club");
        }
    };

    const handleRemoveMember = async (targetUserId) => {
        if (!window.confirm("Remove this member?")) return;
        try {
            await api.removeClubMember(id, targetUserId, user.id);
            setMembers(members.filter(m => m.userId !== targetUserId));
        } catch (err) {
            alert("Failed to remove member");
        }
    };

    const handlePost = async (e) => {
        e.preventDefault();
        if (!newPost.trim() || !membership) return;
        
        try {
            const post = await api.postClubDiscussion(id, {
                userId: user.id,
                userName: user.name,
                text: newPost
            });
            setDiscussions([post, ...discussions]);
            setNewPost('');
        } catch (err) {
            alert("Failed to post message");
        }
    };

    const handleCreatePoll = async (pollData) => {
        try {
            const newPoll = await api.createPoll({ ...pollData, clubId: id });
            setPolls([newPoll, ...polls]);
            setShowPollCreator(false);
        } catch (err) {
            alert("Failed to create poll");
        }
    };

    const handleVotePoll = async (pollId, votes) => {
        try {
            await api.votePoll(pollId, votes);
            // Refresh polls
            const updatedPolls = await api.getPolls(id);
            setPolls(updatedPolls);
        } catch (err) {
            alert("Failed to vote");
        }
    };

    if (loading) return <div className="container" style={{paddingTop: '100px'}}>Loading Club...</div>;
    if (!club) return <div className="container" style={{paddingTop: '100px'}}>Club not found</div>;

    return (
        <div className="club-detail-page animate-fade-in">
            <div className="container">
                <Link to="/community" className="back-link"><ArrowLeft size={18} /> Back to Hub</Link>
                
                <div className="club-header-hero glass-panel">
                    <div className="club-hero-content">
                        <div className="club-hero-icon">{club.image}</div>
                        <div className="club-hero-text">
                            <span className="category-tag">{club.category}</span>
                            {isEditing ? (
                                <form onSubmit={handleEditClub} className="edit-club-form">
                                    <input 
                                        type="text" 
                                        value={editForm.name}
                                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                                    />
                                    <button type="submit" className="btn-primary mini-btn">Save</button>
                                    <button type="button" className="btn-secondary mini-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                                </form>
                            ) : (
                                <div className="title-row">
                                    <h1>{club.name}</h1>
                                    {membership === 'admin' && <button className="icon-btn" onClick={() => setIsEditing(true)}><Settings size={18} /></button>}
                                </div>
                            )}
                            <p className="club-desc">{club.description || 'No description provided.'}</p>
                            <p className="meta-stats"><Users size={16} /> {members.length} members • <span className="role-tag">{membership || 'Guest'}</span></p>
                        </div>
                    </div>
                </div>

                {!membership ? (
                    <div className="join-gate glass-panel animate-slide-up">
                        <h2>Member Access Only</h2>
                        <p>Join this club to participate in discussions and meet other fans.</p>
                        <div className="join-card centered-join">
                            <h3>Join by Unique Code</h3>
                            <div className="code-input-group">
                                <input 
                                    type="text" 
                                    placeholder="Enter Club Code" 
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                />
                                <button className="btn-primary" onClick={handleJoinByCode}>Join Club</button>
                            </div>
                            <p className="code-hint">Ask a club member for the secret join code.</p>
                        </div>
                    </div>
                ) : (
                    <div className="club-content-grid">
                        {membership === 'admin' && (
                            <section className="polls-section">
                                <div className="board-header">
                                    <h2>Group Polls</h2>
                                    <button className="btn-secondary" onClick={() => setShowPollCreator(true)}>Create Poll</button>
                                </div>
                                {polls.length === 0 ? (
                                    <div style={{textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.6)'}}>
                                        No active polls. Create one to decide what to watch!
                                    </div>
                                ) : (
                                    polls.map(poll => (
                                        <PollVoter 
                                            key={poll.id} 
                                            poll={poll} 
                                            onVote={handleVotePoll}
                                            userVotes={userVotes[poll.id] || {}}
                                        />
                                    ))
                                )}
                            </section>
                        )}

                        <MovieTimeline clubId={id} timelines={timelines} />

                        <section className="discussion-board">
                            <div className="board-header">
                                <h2><MessageSquare size={20} /> Discussion Board</h2>
                            </div>

                            <form className="post-input-card glass-panel" onSubmit={handlePost}>
                                <textarea 
                                    placeholder="Share something with the club..." 
                                    value={newPost}
                                    onChange={(e) => setNewPost(e.target.value)}
                                />
                                <div className="post-actions">
                                    <button type="submit" className="btn-primary"><Send size={16} /> Post Message</button>
                                </div>
                            </form>

                            <div className="posts-list">
                                {discussions.map(post => (
                                    <div key={post.id} className="post-card glass-panel">
                                        <div className="post-meta">
                                            <div className="user-avatar">{post.userName ? post.userName[0] : 'U'}</div>
                                            <div className="meta-info">
                                                <strong>{post.userName}</strong>
                                                <span><Calendar size={12} /> {new Date(post.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <p className="post-text">{post.text}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="leaderboard-section">
                            <ClubLeaderboard members={members} />
                        </section>

                        <aside className="club-sidebar">
                            <div className="sidebar-card glass-panel highlight-border">
                                <h3>Invite Friends</h3>
                                <p className="subtitle">Share this code to let others join instantly:</p>
                                <div className="share-code-box">
                                    <code>{club.club_code}</code>
                                    <button className="copy-btn"><ArrowRight size={14} /></button>
                                </div>
                            </div>

                            {membership === 'admin' && (
                                <div className="sidebar-card glass-panel admin-card mt-4">
                                    <h3>Manage Members</h3>
                                    <div className="admin-member-list">
                                        {members.map(m => (
                                            <div key={m.userId} className="admin-member-item">
                                                <span>User {m.userId} <span className="small-role">{m.role}</span></span>
                                                {m.role !== 'admin' && (
                                                    <button className="kick-btn" onClick={() => handleRemoveMember(m.userId)}>
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="sidebar-card glass-panel mt-4">
                                <h3>Club Details</h3>
                                <ul className="rules-list">
                                    <li>Be respectful</li>
                                    <li>No spoilers</li>
                                    <li>Stay on topic</li>
                                </ul>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
}
