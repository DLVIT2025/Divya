import { getCurrentUser, requireAuth, getAuthHeaders } from './auth.js';
import { showToast } from './ui.js';

let activeTab = 'friends-tab';
let activeChatObj = null;
let currentClubId = null;
let activeCdTab = 'cd-discussion';

// ── API Helper ──────────────────────────────────────────────

const socialApi = async (endpoint, options = {}) => {
    const headers = { ...getAuthHeaders(), ...options.headers };
    try {
        const response = await fetch(`http://localhost:3001${endpoint}`, {
            ...options,
            headers
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'API Error');
        }
        return await response.json();
    } catch (err) {
        console.warn(`Social API Failed (${endpoint}):`, err.message);
        throw err;
    }
};

// ── Persistence Fallback ─────────────────────────────────────

const getStoreKey = (type) => {
    const user = getCurrentUser();
    if (!user) return null;
    return `ct_${type}_${user.id}`;
};

const getFriendsLocal = () => {
    const key = getStoreKey('friends');
    return key ? JSON.parse(localStorage.getItem(key)) || [] : [];
};

const saveFriendsLocal = (data) => {
    const key = getStoreKey('friends');
    if (key) localStorage.setItem(key, JSON.stringify(data));
};

const getClubsLocal = () => JSON.parse(localStorage.getItem('ct_clubs_v2')) || [
    { id: 'c1', name: 'Nolan Fans India', desc: 'Discussing Christopher Nolan films.', members: [] },
    { id: 'c2', name: 'Kollywood Maniacs', desc: 'Updates, gossip, and reviews for Tamil Cinema.', members: ['admin'] }
];

const saveClubsLocal = (data) => localStorage.setItem('ct_clubs_v2', JSON.stringify(data));

// ── Initialization ──────────────────────────────────────────

export const initSocial = () => {
    // Universal UI Bindings for Social Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
             document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
             document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
             
             btn.classList.add('active');
             activeTab = btn.dataset.tab;
             const contentEl = document.getElementById(activeTab);
             if (contentEl) contentEl.classList.add('active');

             refreshSocialView();
        });
    });

    // Add Friend Button Setup
    const addFriendBtn = document.getElementById('add-friend-btn');
    if (addFriendBtn) {
        addFriendBtn.addEventListener('click', async () => {
            if (!requireAuth()) return;
            const input = document.getElementById('add-friend-input');
            const targetEmail = (input.value || '').trim().toLowerCase();
            if (!targetEmail) return showToast("Enter a valid username or email!", "error");
            
            try {
                // Try API first
                // In real app we'd search user by email to get ID, but here we'll assume targetEmail is the key
                // For this demo, let's just push to local if API search isn't simple
                const friends = getFriendsLocal();
                if (friends.find(f => f.email === targetEmail)) {
                    return showToast("Already on your list or pending!", 'info');
                }
                
                friends.push({ email: targetEmail, name: targetEmail.split('@')[0], status: 'pending' });
                saveFriendsLocal(friends);
                input.value = '';
                showToast(`Friend request sent to ${targetEmail}`, 'success');
                refreshSocialView();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    }

    // Club Creation Setup
    const createClubBtn = document.getElementById('create-club-btn');
    if (createClubBtn) {
        createClubBtn.addEventListener('click', async () => {
            if (!requireAuth()) return;
            const nameInput = document.getElementById('club-name-input');
            const descInput = document.getElementById('club-desc-input');
            const name = nameInput.value.trim();
            const desc = descInput.value.trim();
            
            if (!name) return showToast("Club Name is required", "error");
            
            try {
                // Try API
                const newClub = await socialApi('/api/social/clubs', {
                    method: 'POST',
                    body: JSON.stringify({ name, description: desc, category: 'General' })
                });
                showToast("Club Created Successfully!", "success");
            } catch (err) {
                // Local Fallback
                const clubs = getClubsLocal();
                const newClub = { id: 'club_' + Date.now(), name, desc, members: [getCurrentUser().id] };
                clubs.push(newClub);
                saveClubsLocal(clubs);
                showToast("Club Created Locally (Offline)", "info");
            }
            
            nameInput.value = '';
            descInput.value = '';
            refreshSocialView();
        });
    }

    // Chat Box Safely Connected
    const sendBtn = document.getElementById('send-msg-btn');
    const chatInput = document.getElementById('chat-input');
    if (sendBtn) {
        const newSendBtn = sendBtn.cloneNode(true);
        sendBtn.replaceWith(newSendBtn);
        newSendBtn.addEventListener('click', sendMessage);
    }
    if (chatInput) {
        const newChatInput = chatInput.cloneNode(true);
        chatInput.replaceWith(newChatInput);
        newChatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // Club Detail Modal Logic
    const closeCdBtn = document.getElementById('close-club-detail');
    if (closeCdBtn) {
        closeCdBtn.addEventListener('click', () => {
            document.getElementById('club-detail-overlay').classList.add('hidden');
        });
    }

    // CD Tabs
    document.querySelectorAll('.cd-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cd-tab').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.cd-tab-content').forEach(c => c.classList.add('hidden'));
            
            btn.classList.add('active');
            activeCdTab = btn.dataset.cdtab;
            document.getElementById(activeCdTab).classList.remove('hidden');
            
            refreshClubDetail();
        });
    });

    // Post Composer
    const postBtn = document.getElementById('club-post-btn');
    if (postBtn) {
        postBtn.addEventListener('click', createPost);
    }

    // Vote Creator
    const voteBtn = document.getElementById('create-vote-btn');
    if (voteBtn) {
        voteBtn.addEventListener('click', createVote);
    }

    // Event Creator
    const eventBtn = document.getElementById('create-event-btn');
    if (eventBtn) {
        eventBtn.addEventListener('click', createEvent);
    }

    // Account Section Activity Loader
    const accountLink = document.querySelector('.nav-link[data-target="my-account-section"]');
    if (accountLink) {
        accountLink.addEventListener('click', () => {
            if(requireAuth()) loadFriendsActivity();
        });
    }
};

const refreshSocialView = () => {
    if (!requireAuth()) return;
    if (activeTab === 'friends-tab') {
        renderFriendsList();
    } else {
        renderClubsList();
    }
};

const loadFriendsActivity = async () => {
    const list = document.getElementById('friends-activity-list');
    if (!list) return;
    try {
        const user = getCurrentUser();
        const activity = await socialApi(`/api/social/friends/${user.id}/activity`);
        if (!activity || !activity.length) {
            list.innerHTML = '<p class="text-muted text-sm">No recent activity from friends.</p>';
            return;
        }
        list.innerHTML = activity.map(a => `
            <div class="list-item" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding: 10px 0;">
                <div class="d-flex" style="gap:1rem; align-items:center;">
                    <div class="avatar" style="width:35px; height:35px; font-size:0.8rem;">${a.friend_name.charAt(0).toUpperCase()}</div>
                    <div>
                        <strong>${a.friend_name}</strong> booked <strong>${a.movie_title || 'a movie'}</strong><br>
                        <small class="text-muted">${new Date(a.created_at).toLocaleDateString()}</small>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.warn('Friends activity load failed:', err.message);
    }
};

// ── Friends Module ──────────────────────────────────────────

const renderFriendsList = () => {
    const list = document.getElementById('friends-list');
    const reqList = document.getElementById('friend-requests-list');
    if (!list || !reqList) return;

    const friends = getFriendsLocal();
    const activeFriends = friends.filter(f => f.status === 'friends');
    const pendingFriends = friends.filter(f => f.status === 'pending');
    
    list.innerHTML = activeFriends.length ? 
        activeFriends.map((f, index) => renderFriendRow(f, index, false)).join('') : 
        '<p class="text-muted text-sm">No friends yet. Add some!</p>';
    
    reqList.innerHTML = pendingFriends.length ? 
        pendingFriends.map((f, index) => renderFriendRow(f, index, true)).join('') : 
        '<p class="text-muted text-sm">No pending requests</p>';
};

const renderFriendRow = (f, index, isPending = false) => `
    <div class="list-item">
        <div class="d-flex" style="gap:1rem;">
            <div class="avatar">${f.name.charAt(0).toUpperCase()}</div>
            <div>
                <strong>${f.name}</strong><br>
                <small class="${isPending ? 'text-accent' : 'text-muted'}">${f.status === 'pending' ? 'Pending Request' : 'Active Friend'}</small>
            </div>
        </div>
        <div>
            ${isPending ? 
                `<button class="icon-btn text-success" onclick="acceptFriend('${f.email}')"><i class="fas fa-check"></i></button>
                 <button class="icon-btn text-danger" onclick="rejectFriend('${f.email}')"><i class="fas fa-times"></i></button>` : 
                `<button class="btn btn-outline" onclick="openChat('friend', '${f.email}', '${f.name}')"><i class="fas fa-comment"></i> Chat</button>`
            }
        </div>
    </div>
`;

window.acceptFriend = (email) => {
    const friends = getFriendsLocal();
    const friend = friends.find(f => f.email === email);
    if(friend) {
        friend.status = 'friends';
        saveFriendsLocal(friends);
        refreshSocialView();
        showToast(`You are now friends!`, 'success');
    }
};

window.rejectFriend = (email) => {
    let friends = getFriendsLocal();
    friends = friends.filter(f => f.email !== email);
    saveFriendsLocal(friends);
    refreshSocialView();
    showToast("Request removed.", 'info');
};

// ── Clubs Module ────────────────────────────────────────────

const renderClubsList = async () => {
    const discoverList = document.getElementById('discover-clubs-list');
    const myList = document.getElementById('my-clubs-list');
    if (!discoverList || !myList) return;

    let clubs = [];
    try {
        clubs = await socialApi('/api/social/clubs');
    } catch (err) {
        clubs = getClubsLocal();
    }

    const user = getCurrentUser();
    if(!user) return;
    
    const myClubs = clubs.filter(c => (c.members || []).includes(user.id) || c.admin_id === user.id);
    const otherClubs = clubs.filter(c => !(c.members || []).includes(user.id) && c.admin_id !== user.id);

    myList.innerHTML = myClubs.length ? myClubs.map(c => renderClubRow(c, true)).join('') : '<p class="text-muted text-sm">You have not joined any clubs.</p>';
    discoverList.innerHTML = otherClubs.length ? otherClubs.map(c => renderClubRow(c, false)).join('') : '<p class="text-muted text-sm">No new clubs to discover.</p>';
};

const renderClubRow = (c, isMember) => `
    <div class="list-item" style="flex-direction:column; align-items:flex-start; gap:0.5rem">
        <strong>${c.name}</strong>
        <p class="text-sm text-muted">${c.description || c.desc}</p>
        <div class="w-100 mt-2 d-flex" style="justify-content:space-between">
            <small>${(c.members || []).length + (c.admin_id ? 1 : 0)} Member(s)</small>
            ${isMember ? 
                `<button class="btn btn-primary" onclick="openClubDetail('${c.id}', '${c.name.replace(/'/g, "\\'")}', '${(c.description || c.desc || '').replace(/'/g, "\\'")}')"><i class="fas fa-users"></i> Enter Club</button>` :
                `<button class="btn btn-outline" onclick="joinClub('${c.id}')"><i class="fas fa-plus"></i> Join</button>`
            }
        </div>
    </div>
`;

window.joinClub = async (clubId) => {
    try {
        const user = getCurrentUser();
        await socialApi(`/api/social/clubs/${clubId}/join`, { method: 'POST' });
        showToast("Successfully joined!", 'success');
        refreshSocialView();
    } catch (err) {
        // Fallback
        const clubs = getClubsLocal();
        const user = getCurrentUser();
        const club = clubs.find(c => c.id === clubId);
        if(club && user && !club.members.includes(user.id)) {
            club.members.push(user.id);
            saveClubsLocal(clubs);
            showToast(`Joined locally`, 'info');
            refreshSocialView();
        }
    }
};

// ── Club Detail Overlay ─────────────────────────────────────

window.openClubDetail = (id, name, desc) => {
    currentClubId = id;
    document.getElementById('club-detail-name').textContent = name;
    document.getElementById('club-detail-desc').textContent = desc;
    document.getElementById('club-detail-overlay').classList.remove('hidden');
    refreshClubDetail();
};

const refreshClubDetail = () => {
    if (activeCdTab === 'cd-discussion') loadClubPosts();
    else if (activeCdTab === 'cd-votes') loadClubVotes();
    else if (activeCdTab === 'cd-events') loadClubEvents();
};

const loadClubPosts = async () => {
    const feed = document.getElementById('club-posts-feed');
    feed.innerHTML = '<p class="text-center p-4">Loading posts...</p>';
    try {
        const posts = await socialApi(`/api/social/clubs/${currentClubId}/posts`);
        if (!posts.length) {
            feed.innerHTML = '<p class="text-muted text-center p-4">Clean slate! Start a conversation.</p>';
            return;
        }
        feed.innerHTML = posts.map(p => `
            <div class="post-card">
                <div class="post-author">${p.author_name} <span class="post-time">${new Date(p.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                <div class="post-content">${p.content}</div>
                <div class="post-actions">
                    <button class="icon-btn" onclick="likePost('${p.id}')"><i class="fas fa-heart ${p.likes.includes(getCurrentUser().id) ? 'text-accent' : ''}"></i> ${p.likes.length}</button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        feed.innerHTML = '<p class="text-muted text-center p-4">Could not load posts. You need to be running the backend server.</p>';
    }
};

const createPost = async () => {
    const input = document.getElementById('club-post-input');
    const content = input.value.trim();
    if (!content) return;
    try {
        await socialApi(`/api/social/clubs/${currentClubId}/posts`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
        input.value = '';
        loadClubPosts();
    } catch (err) { showToast("Failed to post. is server running?", "error"); }
};

window.likePost = async (postId) => {
    try {
        await socialApi(`/api/social/clubs/${currentClubId}/posts/${postId}/like`, { method: 'POST' });
        loadClubPosts();
    } catch (err) {}
};

// ── Votes Module ────────────────────────────────────────────

const loadClubVotes = async () => {
    const feed = document.getElementById('club-votes-feed');
    try {
        const votes = await socialApi(`/api/social/clubs/${currentClubId}/votes`);
        if (!votes.length) {
            feed.innerHTML = '<p class="text-muted text-center p-4">No active polls.</p>';
            return;
        }
        feed.innerHTML = votes.map(v => {
            const total = v.options.reduce((acc, opt) => acc + opt.votes.length, 0);
            return `
                <div class="poll-card">
                    <h4>${v.question}</h4>
                    ${v.options.map((opt, idx) => {
                        const pct = total === 0 ? 0 : Math.round((opt.votes.length / total) * 100);
                        const isSelected = opt.votes.includes(getCurrentUser().id);
                        return `
                            <div class="poll-option" onclick="castVote('${v.id}', ${idx})">
                                <div class="d-flex justify-content-between mb-1">
                                    <span class="${isSelected ? 'text-accent' : ''}">${opt.label}</span>
                                    <span>${pct}%</span>
                                </div>
                                <div class="poll-bar-container">
                                    <div class="poll-bar" style="width: ${pct}%"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                    <p class="text-sm text-muted mt-3">${total} vote(s) cast</p>
                </div>
            `;
        }).join('');
    } catch (err) { feed.innerHTML = '<p class="text-center">Backend required for voting.</p>'; }
};

const createVote = async () => {
    const question = document.getElementById('vote-question').value.trim();
    const opt1 = document.getElementById('vote-opt1').value.trim();
    const opt2 = document.getElementById('vote-opt2').value.trim();
    const opt3 = document.getElementById('vote-opt3').value.trim();
    
    if (!question || !opt1 || !opt2) return showToast("Question and at least 2 options required", "error");
    
    const options = [opt1, opt2];
    if (opt3) options.push(opt3);
    
    try {
        await socialApi(`/api/social/clubs/${currentClubId}/votes`, {
            method: 'POST',
            body: JSON.stringify({ question, options })
        });
        showToast("Poll created", "success");
        loadClubVotes();
        document.getElementById('vote-question').value = '';
        document.getElementById('vote-opt1').value = '';
        document.getElementById('vote-opt2').value = '';
        document.getElementById('vote-opt3').value = '';
    } catch (err) {}
};

window.castVote = async (voteId, optionIndex) => {
    try {
        await socialApi(`/api/social/clubs/${currentClubId}/votes/${voteId}/cast`, {
            method: 'POST',
            body: JSON.stringify({ option_index: optionIndex })
        });
        loadClubVotes();
    } catch (err) {}
};

// ── Events Module ───────────────────────────────────────────

const loadClubEvents = async () => {
    const feed = document.getElementById('club-events-feed');
    try {
        const events = await socialApi(`/api/social/clubs/${currentClubId}/events`);
        if (!events.length) {
            feed.innerHTML = '<p class="text-muted text-center p-4">No upcoming events.</p>';
            return;
        }
        feed.innerHTML = events.map(e => {
            const userStatus = e.rsvps?.[getCurrentUser().id] || 'pending';
            const goingCount = Object.values(e.rsvps || {}).filter(s => s === 'going').length;
            
            return `
                <div class="event-card">
                    <div class="event-details">
                        <h4>${e.title}</h4>
                        <div class="event-meta">
                            <span><i class="fas fa-clock"></i> ${new Date(e.scheduled_at).toLocaleDateString()} at ${new Date(e.scheduled_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            <span><i class="fas fa-map-marker-alt"></i> ${e.location}</span>
                            <span class="text-accent">${goingCount} attending</span>
                        </div>
                    </div>
                    <div class="event-rsvp">
                        <button class="btn ${userStatus === 'going' ? 'btn-primary' : 'btn-outline'}" onclick="rsvpEvent('${e.id}', 'going')">${userStatus === 'going' ? 'Going ✓' : 'Join'}</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {}
};

const createEvent = async () => {
    const title = document.getElementById('event-title').value.trim();
    const location = document.getElementById('event-location').value.trim();
    const dt = document.getElementById('event-datetime').value;
    
    if (!title || !location || !dt) return showToast("All fields required", "error");
    
    try {
        await socialApi(`/api/social/clubs/${currentClubId}/events`, {
            method: 'POST',
            body: JSON.stringify({ title, location, scheduled_at: dt })
        });
        showToast("Event scheduled!", "success");
        loadClubEvents();
        document.getElementById('event-title').value = '';
        document.getElementById('event-location').value = '';
        document.getElementById('event-datetime').value = '';
    } catch (err) {}
};

window.rsvpEvent = async (eventId, status) => {
    try {
        await socialApi(`/api/social/clubs/${currentClubId}/events/${eventId}/rsvp`, {
            method: 'POST',
            body: JSON.stringify({ status })
        });
        loadClubEvents();
    } catch (err) {}
};

// ── Chat Module ─────────────────────────────────────────────

window.openChat = (type, targetId, targetName) => {
    activeChatObj = { type, targetId, name: targetName };
    const nameEl = document.getElementById('chat-title');
    if (nameEl) nameEl.textContent = `Chat: ${targetName}`;
    
    document.getElementById('chat-messages').innerHTML = '';
    
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-msg-btn');
    if(chatInput) {
        chatInput.disabled = false;
        chatInput.focus();
        chatInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if(sendBtn) sendBtn.disabled = false;
    
    renderChatMessages();
};

const renderChatMessages = () => {
    if (!activeChatObj) return;
    const user = getCurrentUser();
    if (!user) return;

    const chatKey = `ct_chat_${activeChatObj.type}_${activeChatObj.targetId}`;
    const messages = JSON.parse(localStorage.getItem(chatKey)) || [];

    const container = document.getElementById('chat-messages');
    if(!container) return;
    
    if (messages.length === 0) {
        container.innerHTML = '<p class="text-muted text-center mt-4">No messages yet. Don\'t be shy, say hi!</p>';
        return;
    }

    container.innerHTML = messages.map(m => `
        <div class="msg-bubble ${m.senderId === user.id ? 'sent' : 'received'}">
            ${activeChatObj.type === 'club' && m.senderId !== user.id ? `<small class="text-muted" style="display:block;margin-bottom:2px">${m.senderName}</small>` : ''}
            ${m.text}
            <small style="display:block; text-align:right; font-size:0.6rem; opacity:0.7; margin-top:4px;">${m.time}</small>
        </div>
    `).join('');
    
    setTimeout(() => { container.scrollTo(0, container.scrollHeight); }, 50);
};

const sendMessage = () => {
    if (!activeChatObj) return showToast("Select a conversation block first.", "info");
    const input = document.getElementById('chat-input');
    if(!input) return;
    
    const text = input.value.trim();
    if (!text) return;

    const user = getCurrentUser();
    if(!user) return;

    const chatKey = `ct_chat_${activeChatObj.type}_${activeChatObj.targetId}`;
    const messages = JSON.parse(localStorage.getItem(chatKey)) || [];

    messages.push({
        senderId: user.id,
        senderName: user.name,
        receiverOrClub: activeChatObj.targetId,
        text: text,
        time: new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})
    });

    localStorage.setItem(chatKey, JSON.stringify(messages));
    input.value = ''; 
    renderChatMessages();

    if(activeChatObj.type === 'friend') {
        const repliedChatTargetId = activeChatObj.targetId;
        setTimeout(() => {
            const m = JSON.parse(localStorage.getItem(chatKey)) || [];
            m.push({
                senderId: 'sim_bot',
                senderName: activeChatObj.name,
                receiverOrClub: user.id,
                text: "Thanks! I'm actually a bot, but let's connect at the movie night!",
                time: new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})
            });
            localStorage.setItem(chatKey, JSON.stringify(m));
            if(activeChatObj && activeChatObj.targetId === repliedChatTargetId) renderChatMessages();
        }, 1500);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initSocial();
});
