import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Initialize LowDB (No PostgreSQL needed!)
const file = new JSONFile('db.json');
const defaultData = {
  users: [],
  movies: [
    { id: 1, title: 'Inception', genre: 'Sci-Fi', language: 'English', duration: 148, rating: 8.8, image: 'https://via.placeholder.com/300x450?text=Inception', ai_match: 95 },
    { id: 2, title: 'The Dark Knight', genre: 'Action', language: 'English', duration: 152, rating: 9.0, image: 'https://via.placeholder.com/300x450?text=Dark+Knight', ai_match: 98 },
    { id: 3, title: 'Interstellar', genre: 'Sci-Fi', language: 'English', duration: 169, rating: 8.6, image: 'https://via.placeholder.com/300x450?text=Interstellar', ai_match: 92 },
    { id: 4, title: 'Dune', genre: 'Sci-Fi', language: 'English', duration: 156, rating: 8.0, image: 'https://via.placeholder.com/300x450?text=Dune', ai_match: 88 },
    { id: 5, title: 'Avatar', genre: 'Sci-Fi', language: 'English', duration: 162, rating: 7.8, image: 'https://via.placeholder.com/300x450?text=Avatar', ai_match: 85 }
  ],
  bookings: [],
  clubs: [
    { id: 1, name: 'Action Lovers', description: 'For action movie enthusiasts', category: 'Action', admin_id: 1, club_code: 'ACT123', image: '🎬' }
  ],
  club_members: [],
  reviews: [],
  polls: [],
  watch_parties: [],
  beverages: [
    { id: 1, name: 'Popcorn (Small)', price: 150, image: '🍿' },
    { id: 2, name: 'Popcorn (Large)', price: 250, image: '🍿' },
    { id: 3, name: 'Coke (250ml)', price: 100, image: '🥤' },
  ]
};

const db = new Low(file, defaultData);
await db.read();

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET || 'test-secret-key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Serve static files from the project root
app.use(express.static(__dirname));

// ===== MOVIES API =====
app.get('/api/movies', (req, res) => {
  try {
    res.json(db.data.movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/movies/:id', (req, res) => {
  try {
    const movie = db.data.movies.find(m => m.id === parseInt(req.params.id));
    res.json(movie || { message: 'Movie not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/movies', async (req, res) => {
  try {
    const movie = { id: db.data.movies.length + 1, ...req.body };
    db.data.movies.push(movie);
    await db.write();
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/movies/:id', async (req, res) => {
  try {
    const movieIdx = db.data.movies.findIndex(m => m.id === parseInt(req.params.id));
    if (movieIdx === -1) return res.status(404).json({ message: 'Movie not found' });
    db.data.movies[movieIdx] = { ...db.data.movies[movieIdx], ...req.body };
    await db.write();
    res.json(db.data.movies[movieIdx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/movies/:id', async (req, res) => {
  try {
    const movieIdx = db.data.movies.findIndex(m => m.id === parseInt(req.params.id));
    if (movieIdx === -1) return res.status(404).json({ message: 'Movie not found' });
    db.data.movies.splice(movieIdx, 1);
    await db.write();
    res.json({ message: 'Movie deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Beverages API
app.get('/api/beverages', (req, res) => {
  try {
    res.json(db.data.beverages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/beverages', authenticateToken, async (req, res) => {
  try {
    db.data.beverages = req.body;
    await db.write();
    res.json(db.data.beverages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== BOOKINGS API =====
app.get('/api/bookings', authenticateToken, (req, res) => {
  try {
    const bookings = db.data.bookings.filter(b => b.user_id === req.user.id);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const booking = {
      id: db.data.bookings.length + 1,
      user_id: req.user.id,
      ...req.body,
      created_at: new Date()
    };
    db.data.bookings.push(booking);
    await db.write();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// allow user to cancel their own booking
app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const idx = db.data.bookings.findIndex(b => b.id === id && b.user_id === req.user.id);
    if (idx === -1) return res.status(404).json({ message: 'Booking not found' });
    db.data.bookings.splice(idx, 1);
    await db.write();
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== AUTH API =====
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (db.data.users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: db.data.users.length + 1,
      email,
      password: hashedPassword,
      name,
      badges: [],
      created_at: new Date()
    };
    db.data.users.push(user);
    await db.write();
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET || 'test-secret-key', { expiresIn: '7d' });
    res.json({ message: 'User created successfully', user: { id: user.id, email, name }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// password reset request - store token on user (mock email)
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = db.data.users.find(u => u.email === email);
    if (!user) {
      // don't reveal existence
      return res.json({ message: 'If that email is registered, you will receive a reset link.' });
    }
    const token = Math.random().toString(36).substring(2, 15) + Date.now();
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour
    await db.write();
    // in real app you would email the link containing token
    res.json({ message: 'Password reset link generated', resetToken: token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = db.data.users.find(u => u.resetToken === token && u.resetTokenExpiry > Date.now());
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    delete user.resetToken;
    delete user.resetTokenExpiry;
    await db.write();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.data.users.find(u => u.email === email);
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET || 'test-secret-key', { expiresIn: '7d' });
    res.json({ message: 'Login successful', user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Social Login (Google/Facebook) — auto-create or find user by email
app.post('/api/auth/social-login', async (req, res) => {
  try {
    const { name, email, provider } = req.body;
    if (!email || !name) return res.status(400).json({ message: 'Name and email required' });

    let user = db.data.users.find(u => u.email === email);
    if (!user) {
      // First time: auto-register
      const hashedPassword = await bcrypt.hash(`${provider}_oauth_${Date.now()}`, 10);
      user = {
        id: db.data.users.length + 1,
        name,
        email,
        password: hashedPassword,
        provider,
        badges: [],
        created_at: new Date()
      };
      db.data.users.push(user);
      await db.write();
    }
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET || 'test-secret-key', { expiresIn: '7d' });
    res.json({ message: `Signed in with ${provider}`, user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Simple API endpoints without PostgreSQL - using mock data
app.get('/api/users/:id', (req, res) => {
  try {
    const user = db.data.users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const userIdx = db.data.users.findIndex(u => u.id === parseInt(req.params.id));
    if (userIdx === -1) return res.status(404).json({ message: 'User not found' });
    db.data.users[userIdx] = { ...db.data.users[userIdx], ...req.body };
    await db.write();
    const { password, ...safeUser } = db.data.users[userIdx];
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id/bookings', authenticateToken, (req, res) => {
  try {
    const bookings = db.data.bookings.filter(b => b.user_id === parseInt(req.params.id));
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id/clubs', authenticateToken, (req, res) => {
  try {
    const members = db.data.club_members.filter(m => m.user_id === parseInt(req.params.id));
    const clubs = members.map(m => {
      const club = db.data.clubs.find(c => c.id === m.club_id);
      return { ...club, role: m.role };
    });
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/friends/:userId', (req, res) => {
  try {
    // Mock friends endpoint
    res.json([
      { id: 2, name: 'Priya', email: 'priya@example.com' },
      { id: 3, name: 'Akash', email: 'akash@example.com' }
    ]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/friends/add', authenticateToken, async (req, res) => {
  try {
    res.json({ message: 'Friend added!', friend: { id: 2, name: 'Friend Name' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== CLUBS API =====
app.get('/api/clubs', (req, res) => {
  try {
    res.json(db.data.clubs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clubs', authenticateToken, async (req, res) => {
  try {
    const club = {
      id: db.data.clubs.length + 1,
      admin_id: req.user.id,
      club_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      image: '🎬',
      ...req.body,
      created_at: new Date()
    };
    db.data.clubs.push(club);
    await db.write();
    res.json(club);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/clubs/:id', (req, res) => {
  try {
    const club = db.data.clubs.find(c => c.id === parseInt(req.params.id));
    if (!club) return res.status(404).json({ message: 'Club not found' });
    res.json(club);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/clubs/:id/members', (req, res) => {
  try {
    const members = db.data.club_members.filter(m => m.club_id === parseInt(req.params.id));
    const enriched = members.map(m => {
      const user = db.data.users.find(u => u.id === m.user_id);
      return { ...m, userName: user?.name || 'Unknown' };
    });
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clubs/:id/join', authenticateToken, async (req, res) => {
  try {
    const member = {
      id: db.data.club_members.length + 1,
      club_id: parseInt(req.params.id),
      user_id: req.user.id,
      role: 'member',
      joined_at: new Date()
    };
    db.data.club_members.push(member);
    await db.write();
    res.json({ message: 'Joined club successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== POLLS API =====
app.post('/api/polls', authenticateToken, async (req, res) => {
  try {
    const poll = {
      id: db.data.polls.length + 1,
      created_by: req.user.id,
      votes: {},
      ...req.body,
      created_at: new Date()
    };
    db.data.polls.push(poll);
    await db.write();
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/polls/:clubId', (req, res) => {
  try {
    const polls = db.data.polls.filter(p => p.club_id === parseInt(req.params.clubId));
    res.json(polls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/polls/:id/vote', authenticateToken, async (req, res) => {
  try {
    const poll = db.data.polls.find(p => p.id === parseInt(req.params.id));
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    
    poll.votes = req.body;
    await db.write();
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== REVIEWS API =====
app.get('/api/reviews/:movieId', (req, res) => {
  try {
    const reviews = db.data.reviews.filter(r => r.movie_id === parseInt(req.params.movieId));
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const review = {
      id: db.data.reviews.length + 1,
      user_id: req.user.id,
      user_name: req.user.name,
      ...req.body,
      created_at: new Date()
    };
    db.data.reviews.push(review);
    await db.write();
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== WATCH PARTIES API =====
app.get('/api/watch-parties', (req, res) => {
  try {
    res.json(db.data.watch_parties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/watch-parties', authenticateToken, async (req, res) => {
  try {
    const party = {
      id: db.data.watch_parties.length + 1,
      ...req.body,
      created_at: new Date()
    };
    db.data.watch_parties.push(party);
    await db.write();
    res.json(party);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== EVENTS/WATCH PARTIES API =====
app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    const event = {
      id: db.data.watch_parties.length + 1,
      created_by: req.user.id,
      attendees: [req.user.id],
      rsvps: { [req.user.id]: 'going' },
      ...req.body,
      created_at: new Date()
    };
    db.data.watch_parties.push(event);
    await db.write();
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events/:id/rsvp', authenticateToken, async (req, res) => {
  try {
    const event = db.data.watch_parties.find(e => e.id === parseInt(req.params.id));
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    event.rsvps = event.rsvps || {};
    event.rsvps[req.user.id] = req.body.status; // 'going' or 'not_going'
    if (!event.attendees) event.attendees = [];
    if (req.body.status === 'going' && !event.attendees.includes(req.user.id)) {
      event.attendees.push(req.user.id);
    }
    await db.write();
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== DISCUSSIONS API =====
app.post('/api/discussions', authenticateToken, async (req, res) => {
  try {
    if (!db.data.discussions) db.data.discussions = [];
    const discussion = {
      id: db.data.discussions.length + 1,
      user_id: req.user.id,
      user_name: req.user.name,
      likes: [],
      replies: [],
      ...req.body,
      created_at: new Date()
    };
    db.data.discussions.push(discussion);
    await db.write();
    res.json(discussion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/discussions/movie/:movieId', (req, res) => {
  try {
    if (!db.data.discussions) return res.json([]);
    const discussions = db.data.discussions.filter(d => d.movie_id === parseInt(req.params.movieId));
    res.json(discussions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/discussions/:id/like', authenticateToken, async (req, res) => {
  try {
    if (!db.data.discussions) return res.status(404).json({ message: 'Discussion not found' });
    const discussion = db.data.discussions.find(d => d.id === parseInt(req.params.id));
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });
    
    if (!discussion.likes) discussion.likes = [];
    if (!discussion.likes.includes(req.user.id)) {
      discussion.likes.push(req.user.id);
    }
    await db.write();
    res.json(discussion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== FRIEND SEATS API =====
app.get('/api/bookings/friends/:userId', authenticateToken, (req, res) => {
  try {
    const friendBookings = db.data.bookings.filter(b => b.user_id === parseInt(req.params.userId));
    res.json(friendBookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== SPLIT PAYMENTS API =====
app.post('/api/split-payments', authenticateToken, async (req, res) => {
  try {
    if (!db.data.split_payments) db.data.split_payments = [];
    const payment = {
      id: db.data.split_payments.length + 1,
      initiated_by: req.user.id,
      status: 'pending',
      participants: req.body.participants || [],
      total_amount: req.body.total_amount,
      per_person: req.body.per_person,
      paid_by: {},
      ...req.body,
      created_at: new Date()
    };
    db.data.split_payments.push(payment);
    await db.write();
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/split-payments/:id/pay', authenticateToken, async (req, res) => {
  try {
    const payment = db.data.split_payments.find(p => p.id === parseInt(req.params.id));
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    
    if (!payment.paid_by) payment.paid_by = {};
    payment.paid_by[req.user.id] = true;
    
    // Check if all participants have paid
    const allPaid = payment.participants.every(p => payment.paid_by[p]);
    if (allPaid) payment.status = 'completed';
    
    await db.write();
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== MOVIE TIMELINE API =====
app.get('/api/clubs/:id/timeline', (req, res) => {
  try {
    const club = db.data.clubs.find(c => c.id === parseInt(req.params.id));
    if (!club) return res.status(404).json({ message: 'Club not found' });
    
    const timeline = club.timeline || [];
    res.json(timeline);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clubs/:id/timeline', authenticateToken, async (req, res) => {
  try {
    const club = db.data.clubs.find(c => c.id === parseInt(req.params.id));
    if (!club) return res.status(404).json({ message: 'Club not found' });
    
    if (!club.timeline) club.timeline = [];
    const entry = {
      id: club.timeline.length + 1,
      movie_id: req.body.movie_id,
      movie_title: req.body.movie_title,
      watched_date: req.body.watched_date,
      attendees: req.body.attendees || [],
      rating: req.body.rating,
      notes: req.body.notes,
      added_by: req.user.id,
      created_at: new Date()
    };
    club.timeline.push(entry);
    await db.write();
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Socket.io for real-time
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-club', (clubId) => {
    socket.join(`club-${clubId}`);
  });

  socket.on('leave-club', (clubId) => {
    socket.leave(`club-${clubId}`);
  });

  socket.on('send-message', (data) => {
    // For now, just broadcast
    io.to(`club-${data.clubId}`).emit('new-message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 3001; // API runs on 3001 to avoid conflict with Vite
server.listen(PORT, () => {
  console.log(`Persistent API server running on http://localhost:${PORT}`);
});