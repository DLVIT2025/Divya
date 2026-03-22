const API_BASE_URL = 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  // Auth
  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (data.token) localStorage.setItem('token', data.token);
    return data;
  },
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await response.json();
    if (data.token) localStorage.setItem('token', data.token);
    return data;
  },
  socialLogin: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/social-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (data.token) localStorage.setItem('token', data.token);
    return data;
  },

  // Movies
  getMovies: async () => {
    const response = await fetch(`${API_BASE_URL}/movies`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },
  addMovie: async (movie) => {
    const response = await fetch(`${API_BASE_URL}/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(movie)
    });
    return response.json();
  },
  updateMovie: async (id, movie) => {
    const response = await fetch(`${API_BASE_URL}/movies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(movie)
    });
    return response.json();
  },
  deleteMovie: async (id) => {
    const response = await fetch(`${API_BASE_URL}/movies/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Beverages
  getBeverages: async () => {
    const response = await fetch(`${API_BASE_URL}/beverages`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },
  updateBeverages: async (beverages) => {
    const response = await fetch(`${API_BASE_URL}/beverages`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(beverages)
    });
    return response.json();
  },

  // Bookings
  getBookings: async () => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },
  addBooking: async (booking) => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(booking)
    });
    return response.json();
  },

  // Users
  getUser: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },
  updateUser: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  getUserBookings: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/bookings`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },
  getUserClubs: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/clubs`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Friends
  getFriends: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/friends/${userId}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },
  addFriend: async (data) => {
    const response = await fetch(`${API_BASE_URL}/friends/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  removeFriend: async (userId, friendId) => {
    const response = await fetch(`${API_BASE_URL}/friends/${userId}/${friendId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },
  getFriendsBookings: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/friends/${userId}/bookings`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Community
  getClubs: async () => {
    const response = await fetch(`${API_BASE_URL}/community/clubs`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },
  createClub: async (data) => {
    const response = await fetch(`${API_BASE_URL}/community/clubs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  updateClub: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/community/clubs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  joinClub: async (data) => {
    const response = await fetch(`${API_BASE_URL}/community/clubs/join-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  removeMember: async (clubId, userId) => {
    const response = await fetch(`${API_BASE_URL}/community/clubs/${clubId}/members/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },
  getClubMembers: async (clubId) => {
    const response = await fetch(`${API_BASE_URL}/community/clubs/${clubId}/members`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },
  getNotifications: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/community/notifications/${userId}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },
  getClubDiscussions: async (clubId) => {
    // Placeholder, since not implemented
    return [];
  },
  getWatchParties: async () => {
    const response = await fetch(`${API_BASE_URL}/community/parties`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },
  joinWatchParty: async (id) => {
    const response = await fetch(`${API_BASE_URL}/community/parties/${id}/join`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Reviews
  getReviews: async (movieId) => {
    const response = await fetch(`${API_BASE_URL}/community/reviews/${movieId}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },
  addReview: async (data) => {
    const response = await fetch(`${API_BASE_URL}/community/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Activity
  getFriendsActivity: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/community/friends/activity/${userId}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Polls
  createPoll: async (data) => {
    const response = await fetch(`${API_BASE_URL}/polls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  getPolls: async (clubId) => {
    const response = await fetch(`${API_BASE_URL}/polls/${clubId}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },
  votePoll: async (pollId, data) => {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Password management
  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return response.json();
  },
  resetPassword: async (token, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    return response.json();
  },

  // Booking management
  cancelBooking: async (bookingId) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};
