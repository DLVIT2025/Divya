import { getCurrentUser, requireAuth } from './auth.js';
import { showToast, navigateTo } from './ui.js';
import { 
    fetchClubs, 
    createClub, 
    joinClub, 
    fetchPosts, 
    createPost 
} from './data.js';

let activeClub = null;
let chatInterval = null;

export const initSocial = () => {
    // Navigation binding
    const communityLink = document.querySelector('.nav-link[data-target="community-section"]');
    if (communityLink) {
        communityLink.addEventListener('click', () => {
            if (requireAuth()) {
                renderCommunity();
            }
        });
    }

    // Modal Controls
    const openCreateBtn = document.getElementById('open-create-club-btn');
    const closeCreateBtn = document.getElementById('close-create-club-btn');
    const createOverlay = document.getElementById('create-club-overlay');

    if (openCreateBtn) {
        openCreateBtn.onclick = () => createOverlay.classList.remove('hidden');
    }
    if (closeCreateBtn) {
        closeCreateBtn.onclick = () => createOverlay.classList.add('hidden');
    }

    // Create Club Form
    const createForm = document.getElementById('create-club-form');
    if (createForm) {
        createForm.onsubmit = async (e) => {
            e.preventDefault();
            const user = getCurrentUser();
            if (!user) return;

            const name = document.getElementById('new-club-name').value.trim();
            const desc = document.getElementById('new-club-desc').value.trim();

            if (!name || !desc) return showToast("Please fill all fields", "error");

            const result = await createClub({
                name,
                description: desc,
                createdBy: user.uid
            });

            if (result.success) {
                showToast("Club Created!", "success");
                createForm.reset();
                createOverlay.classList.add('hidden');
                renderCommunity();
            } else {
                showToast("Failed to create club", "error");
            }
        };
    }

    // Chat Controls
    const closeChatBtn = document.getElementById('close-chat-btn');
    if (closeChatBtn) {
        closeChatBtn.onclick = closeClubChat;
    }

    const sendMsgBtn = document.getElementById('send-club-msg-btn');
    const chatInput = document.getElementById('club-chat-input');

    if (sendMsgBtn) {
        sendMsgBtn.onclick = sendChatMessage;
    }
    if (chatInput) {
        chatInput.onkeypress = (e) => {
            if (e.key === 'Enter') sendChatMessage();
        };
    }
};

export const renderCommunity = async () => {
    const list = document.getElementById('clubs-list');
    if (!list) return;

    list.innerHTML = '<p class="text-muted">Loading communities...</p>';
    const clubs = await fetchClubs();
    const user = getCurrentUser();

    if (clubs.length === 0) {
        list.innerHTML = '<p class="text-muted">No communities yet. Create the first one!</p>';
        return;
    }

    list.innerHTML = clubs.map(club => {
        const isMember = club.members?.includes(user.uid);
        return `
            <div class="movie-card" style="padding: 1.5rem; height: auto;">
                <div class="card-info" style="padding: 0;">
                    <h3 class="card-title" style="white-space: normal;">${club.name}</h3>
                    <p class="text-muted text-sm mb-4" style="min-height: 45px;">${club.description}</p>
                    <div class="card-meta" style="margin-top: 1rem;">
                        <span class="badge">${club.members?.length || 0} Members</span>
                        ${isMember ? 
                            `<button class="btn btn-outline btn-sm" onclick="openClubChatById('${club.id}')">Enter Chat</button>` :
                            `<button class="btn btn-primary btn-sm" onclick="handleJoinClub('${club.id}')">Join Club</button>`
                        }
                    </div>
                </div>
            </div>
        `;
    }).join('');
};

window.handleJoinClub = async (clubId) => {
    const user = getCurrentUser();
    if (!user) return;

    const result = await joinClub(clubId, user.uid);
    if (result.success) {
        showToast("Joined Community!", "success");
        renderCommunity();
    } else {
        showToast("Failed to join", "error");
    }
};

window.openClubChatById = async (clubId) => {
    const clubs = await fetchClubs();
    const club = clubs.find(c => c.id === clubId);
    if (club) openClubChat(club);
};

export const openClubChat = (club) => {
    activeClub = club;
    const overlay = document.getElementById('club-chat-overlay');
    document.getElementById('chat-club-name').textContent = club.name;
    document.getElementById('chat-club-desc').textContent = club.description;
    
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Start polling for messages (Simple real-time simulation)
    refreshChatMessages();
    chatInterval = setInterval(refreshChatMessages, 3000);
};

export const closeClubChat = () => {
    activeClub = null;
    if (chatInterval) clearInterval(chatInterval);
    document.getElementById('club-chat-overlay').classList.add('hidden');
    document.body.style.overflow = '';
};

const refreshChatMessages = async () => {
    if (!activeClub) return;
    let messages = await fetchPosts(activeClub.id);
    
    // Sort in memory to avoid Firestore Index requirement
    messages.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeA - timeB;
    });

    const container = document.getElementById('club-messages');
    const user = getCurrentUser();

    if (messages.length === 0) {
        container.innerHTML = '<p class="text-muted text-center py-8">No messages yet. Start the conversation!</p>';
        return;
    }

    container.innerHTML = messages.map(m => `
        <div class="msg-bubble ${m.userId === user.uid ? 'sent' : 'received'}" style="margin-bottom: 1rem;">
            ${m.userId !== user.id ? `<small class="text-muted d-block mb-1">${m.userName}</small>` : ''}
            <div>${m.message}</div>
            <small style="font-size: 0.65rem; opacity: 0.7; display: block; text-align: right; margin-top: 4px;">
                ${m.createdAt ? new Date(m.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
            </small>
        </div>
    `).join('');

    // Scroll to bottom only if user was already at bottom or if it's the first load
    container.scrollTop = container.scrollHeight;
};

const sendChatMessage = async () => {
    const input = document.getElementById('club-chat-input');
    const msg = input.value.trim();
    const user = getCurrentUser();

    if (!msg || !activeClub || !user) return;

    input.value = '';
    const result = await createPost({
        clubId: activeClub.id,
        userId: user.uid,
        userName: user.name,
        message: msg
    });

    if (result.success) {
        refreshChatMessages();
    } else {
        showToast("Failed to send message", "error");
    }
};
