import { getCurrentUser, requireAuth } from './auth.js';
import { showToast } from './ui.js';

let activeTab = 'friends-tab';
let activeChatObj = null;

const getStoreKey = (type) => {
    const user = getCurrentUser();
    if (!user) return null;
    return `ct_${type}_${user.id}`; // Handle user-isolated friends
};

const getFriends = () => {
    const key = getStoreKey('friends');
    if(!key) return [];
    return JSON.parse(localStorage.getItem(key)) || [];
};

const saveFriends = (data) => {
    const key = getStoreKey('friends');
    if(key) localStorage.setItem(key, JSON.stringify(data));
};

const getClubs = () => JSON.parse(localStorage.getItem('ct_clubs_v2')) || [
    { id: 'c1', name: 'Nolan Fans India', desc: 'Discussing Christopher Nolan films.', members: [] },
    { id: 'c2', name: 'Kollywood Maniacs', desc: 'Updates, gossip, and reviews for Tamil Cinema.', members: ['admin'] }
];
const saveClubs = (data) => localStorage.setItem('ct_clubs_v2', JSON.stringify(data));

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
        addFriendBtn.addEventListener('click', () => {
            if (!requireAuth()) return;
            const input = document.getElementById('add-friend-input');
            const friendEmail = (input.value || '').trim().toLowerCase();
            if (!friendEmail) return showToast("Enter a valid username or email!", "error");
            
            const user = getCurrentUser();
            if (friendEmail === user.email.toLowerCase()) return showToast("You can't add yourself!", 'error');
            
            const friends = getFriends();
            if (friends.find(f => f.email === friendEmail)) {
                return showToast("Already on your list or pending!", 'info');
            }
            
            // Push request properly to local database simulator
            friends.push({ email: friendEmail, name: friendEmail.split('@')[0], status: 'pending' });
            saveFriends(friends);
            input.value = '';
            showToast(`Friend request sent to ${friendEmail}`, 'success');
            refreshSocialView();
        });
    }

    // Club Creation Setup
    const createClubBtn = document.getElementById('create-club-btn');
    if (createClubBtn) {
        createClubBtn.addEventListener('click', () => {
            if (!requireAuth()) return;
            const nameInput = document.getElementById('club-name-input');
            const descInput = document.getElementById('club-desc-input');
            const name = nameInput.value.trim();
            const desc = descInput.value.trim();
            
            if (!name) return showToast("Club Name is required", "error");
            
            const clubs = getClubs();
            const newClub = {
                id: 'club_' + Date.now(),
                name: name,
                desc: desc,
                members: [getCurrentUser().id] // Join automatically on creation
            };
            clubs.push(newClub);
            saveClubs(clubs);
            
            nameInput.value = '';
            descInput.value = '';
            showToast("Club Created Successfully!", "success");
            refreshSocialView();
        });
    }

    // Chat Box Safely Connected
    const sendBtn = document.getElementById('send-msg-btn');
    const chatInput = document.getElementById('chat-input');
    
    if (sendBtn) {
        // Cloning prevents double-firing if initSocial runs twice over a SPA session
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

    // Detect section route transitions to force immediate repaint
    const navLink = document.querySelector('.nav-link[data-target="social-section"]');
    if (navLink) {
        navLink.addEventListener('click', () => {
            if(requireAuth()) refreshSocialView();
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

// ============================================
// FRIENDS MODULE
// ============================================

const renderFriendsList = () => {
    const list = document.getElementById('friends-list');
    const reqList = document.getElementById('friend-requests-list');
    if (!list || !reqList) return;

    const friends = getFriends();
    const activeFriends = friends.filter(f => f.status === 'friends');
    const pendingFriends = friends.filter(f => f.status === 'pending');
    
    if (activeFriends.length === 0) {
        list.innerHTML = '<p class="text-muted text-sm">No friends yet. Add some!</p>';
    } else {
        list.innerHTML = activeFriends.map((f, index) => renderFriendRow(f, index, false)).join('');
    }
    
    if (pendingFriends.length === 0) {
        reqList.innerHTML = '<p class="text-muted text-sm">No pending requests</p>';
    } else {
        reqList.innerHTML = pendingFriends.map((f, index) => renderFriendRow(f, index, true)).join('');
    }
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
    const friends = getFriends();
    const friend = friends.find(f => f.email === email);
    if(friend) {
        friend.status = 'friends';
        saveFriends(friends);
        refreshSocialView();
        showToast(`You are now friends!`, 'success');
    }
};

window.rejectFriend = (email) => {
    let friends = getFriends();
    friends = friends.filter(f => f.email !== email); // purge
    saveFriends(friends);
    refreshSocialView();
    showToast("Request removed.", 'info');
};

// ============================================
// CLUBS MODULE
// ============================================

const renderClubsList = () => {
    const discoverList = document.getElementById('discover-clubs-list');
    const myList = document.getElementById('my-clubs-list');
    if (!discoverList || !myList) return;

    const clubs = getClubs();
    const user = getCurrentUser();
    if(!user) return;
    
    const myClubs = clubs.filter(c => c.members.includes(user.id));
    const otherClubs = clubs.filter(c => !c.members.includes(user.id));

    myList.innerHTML = myClubs.length ? myClubs.map(c => renderClubRow(c, true)).join('') : '<p class="text-muted text-sm">You have not joined any clubs.</p>';
    discoverList.innerHTML = otherClubs.length ? otherClubs.map(c => renderClubRow(c, false)).join('') : '<p class="text-muted text-sm">No new clubs to discover.</p>';
};

const renderClubRow = (c, isMember) => `
    <div class="list-item" style="flex-direction:column; align-items:flex-start; gap:0.5rem">
        <strong>${c.name}</strong>
        <p class="text-sm text-muted">${c.desc}</p>
        <div class="w-100 mt-2 d-flex" style="justify-content:space-between">
            <small>${c.members.length} Member(s)</small>
            ${isMember ? 
                `<button class="btn btn-outline" onclick="openChat('club', '${c.id}', '${c.name}')"><i class="fas fa-users"></i> Enter Chat</button>` :
                `<button class="btn btn-primary" onclick="joinClub('${c.id}')"><i class="fas fa-plus"></i> Join</button>`
            }
        </div>
    </div>
`;

window.joinClub = (clubId) => {
    const clubs = getClubs();
    const user = getCurrentUser();
    const club = clubs.find(c => c.id === clubId);
    if(club && user && !club.members.includes(user.id)) {
        club.members.push(user.id);
        saveClubs(clubs);
        showToast(`Successfully joined ${club.name}!`, 'success');
        refreshSocialView();
    }
};

// ============================================
// CHAT MODULE
// ============================================

window.openChat = (type, targetId, targetName) => {
    activeChatObj = { type, targetId, name: targetName };
    const nameEl = document.getElementById('chat-title');
    if (nameEl) nameEl.textContent = `Chat: ${targetName}`;
    
    document.getElementById('chat-messages').innerHTML = ''; // clear slate
    
    // Unlock UI Fields
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

    // Chat uniqueness based on combination of type and specific target ID
    const chatKey = `ct_chat_${activeChatObj.type}_${activeChatObj.targetId}`;
    const messages = JSON.parse(localStorage.getItem(chatKey)) || [];

    const container = document.getElementById('chat-messages');
    if(!container) return;
    
    if (messages.length === 0) {
        container.innerHTML = '<p class="text-muted text-center mt-4" style="font-size: 0.9rem;">No messages yet. Don\'t be shy, say hi!</p>';
        return;
    }

    container.innerHTML = messages.map(m => `
        <div class="msg-bubble ${m.senderId === user.id ? 'sent' : 'received'}">
            ${activeChatObj.type === 'club' && m.senderId !== user.id ? `<small class="text-muted" style="display:block;margin-bottom:2px">${m.senderName}</small>` : ''}
            ${m.text}
            <small style="display:block; text-align:right; font-size:0.6rem; opacity:0.7; margin-top:4px;">${m.time}</small>
        </div>
    `).join('');
    
    // Auto scroll bottom slightly debounced to ensure layout is calculated
    setTimeout(() => {
        container.scrollTo(0, container.scrollHeight);
    }, 50);
};

const sendMessage = () => {
    if (!activeChatObj) return showToast("Select a conversation block first.", "info");
    const input = document.getElementById('chat-input');
    if(!input) return;
    
    const text = input.value.trim();
    if (!text) return; // ignore completely empty pushes

    const user = getCurrentUser();
    if(!user) return;

    const chatKey = `ct_chat_${activeChatObj.type}_${activeChatObj.targetId}`;
    const messages = JSON.parse(localStorage.getItem(chatKey)) || [];

    // Conform message to structured JSON shape
    messages.push({
        senderId: user.id,
        senderName: user.name,
        receiverOrClub: activeChatObj.targetId,
        text: text,
        time: new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})
    });

    localStorage.setItem(chatKey, JSON.stringify(messages));
    
    // Clear input & Force an instant repaint of the log
    input.value = ''; 
    renderChatMessages();

    // Auto-reply Bot Simulation context (only triggers inside friend chats for engagement validation)
    if(activeChatObj.type === 'friend') {
        const repliedChatTargetId = activeChatObj.targetId; // Capture reference context
        
        setTimeout(() => {
            const m = JSON.parse(localStorage.getItem(chatKey)) || [];
            m.push({
                senderId: 'sim_bot',
                senderName: activeChatObj.name,
                receiverOrClub: user.id,
                text: "Thanks! I got your message.",
                time: new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})
            });
            localStorage.setItem(chatKey, JSON.stringify(m));
            
            // Only re - render active view if the user hasn't switched to another conversation in 1.5 seconds!
            if(activeChatObj && activeChatObj.targetId === repliedChatTargetId) {
                renderChatMessages();
            }
        }, 1500);
    }
};

// Safe startup hook if initialized entirely independent. (Typically run centrally via app.js)
document.addEventListener('DOMContentLoaded', () => {
    initSocial();
});
