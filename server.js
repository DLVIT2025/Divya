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

// Serve static files from the root directory
app.use(express.static(__dirname));

// Root route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize LowDB (No PostgreSQL needed!)
const file = new JSONFile('db.json');
const defaultData = {
  users: [],
  movies: [
    { id: 1, title: 'Inception', genre: 'Sci-Fi', language: 'English', duration: 148, rating: 8.8, image: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg', ai_match: 95, cities: ['Mumbai', 'Delhi-NCR', 'Pune', 'Ahmedabad'] },
    { id: 2, title: 'The Dark Knight', genre: 'Action', language: 'English', duration: 152, rating: 9.0, image: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', ai_match: 98, cities: ['Mumbai', 'Bengaluru', 'Ahmedabad'] },
    { id: 3, title: 'Interstellar', genre: 'Sci-Fi', language: 'English', duration: 169, rating: 8.6, image: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', ai_match: 92, cities: ['Delhi-NCR', 'Pune', 'Hyderabad', 'Kochi'] },
    { id: 4, title: 'Leo', genre: 'Action', language: 'Tamil', duration: 164, rating: 8.2, image: 'https://image.tmdb.org/t/p/w500/pE1P9hEUH7Agb32fW28Ew0o1vQZ.jpg', ai_match: 90, cities: ['Chennai', 'Bengaluru', 'Kochi'] },
    { id: 5, title: 'Vikram', genre: 'Action', language: 'Tamil', duration: 173, rating: 8.5, image: 'https://image.tmdb.org/t/p/w500/1XvBwQoZq2z51786k5S9K6T8cQ1.jpg', ai_match: 96, cities: ['Chennai', 'Kolkata', 'Hyderabad'] },
    { id: 6, title: 'Jailer', genre: 'Action', language: 'Tamil', duration: 168, rating: 8.1, image: 'https://image.tmdb.org/t/p/w500/vQ5T84t8h4N2xAswNFWHCkh8sNw.jpg', ai_match: 88, cities: ['Chennai', 'Mumbai'] },
    { id: 7, title: 'RRR', genre: 'Action', language: 'Telugu', duration: 187, rating: 8.9, image: 'https://image.tmdb.org/t/p/w500/nEufeZlyAOLqO2brrs0yeO1WMeP.jpg', ai_match: 94, cities: ['Hyderabad', 'Bengaluru', 'Ahmedabad', 'Delhi-NCR'] },
    { id: 8, title: 'Pushpa: The Rise', genre: 'Action', language: 'Telugu', duration: 179, rating: 8.0, image: 'https://image.tmdb.org/t/p/w500/1LAx0BscA2H0zL5p4GfNtcwP6R5.jpg', ai_match: 87, cities: ['Hyderabad', 'Mumbai'] },
    { id: 9, title: 'Baahubali 2: The Conclusion', genre: 'Action', language: 'Telugu', duration: 167, rating: 8.8, image: 'https://image.tmdb.org/t/p/w500/21sC2assImQIyc88D4dd2K01xO2.jpg', ai_match: 93, cities: ['Hyderabad', 'Chennai', 'Delhi-NCR'] },
    { id: 10, title: 'Jawan', genre: 'Action', language: 'Hindi', duration: 169, rating: 7.9, image: 'https://image.tmdb.org/t/p/w500/jIWSU8k1q6Bto2yA2gW9b2Zz7Bf.jpg', ai_match: 85, cities: ['Mumbai', 'Delhi-NCR', 'Pune', 'Ahmedabad', 'Kolkata', 'Chandigarh'] },
    { id: 11, title: 'Pathaan', genre: 'Action', language: 'Hindi', duration: 146, rating: 7.6, image: 'https://image.tmdb.org/t/p/w500/mSmsjEIKNq4in1R5R2N2Fk2iZqF.jpg', ai_match: 84, cities: ['Mumbai', 'Delhi-NCR', 'Chandigarh'] },
    { id: 12, title: 'Dangal', genre: 'Drama', language: 'Hindi', duration: 161, rating: 8.7, image: 'https://image.tmdb.org/t/p/w500/cvaRk1Lp3ZofU1HncI4MvR5R02G.jpg', ai_match: 91, cities: ['Mumbai', 'Delhi-NCR', 'Ahmedabad', 'Kolkata'] },
    { id: 13, title: 'Minnal Murali', genre: 'Action', language: 'Malayalam', duration: 158, rating: 8.3, image: 'https://image.tmdb.org/t/p/w500/xXSVxN1rU3xP6R49wU1D0kKk0hF.jpg', ai_match: 89, cities: ['Kochi', 'Bengaluru'] },
    { id: 14, title: 'Drishyam', genre: 'Thriller', language: 'Malayalam', duration: 160, rating: 8.6, image: 'https://image.tmdb.org/t/p/w500/aP9d0nL6c2zBw5sWw9qL75R4M1j.jpg', ai_match: 92, cities: ['Kochi', 'Bengaluru', 'Chennai'] },
    { id: 15, title: 'Premam', genre: 'Romance', language: 'Malayalam', duration: 156, rating: 8.4, image: 'https://image.tmdb.org/t/p/w500/w7P58Uj9Lz8BvP7lE0H3G3G4l1J.jpg', ai_match: 90, cities: ['Kochi', 'Bengaluru', 'Pune'] }
  ],
  bookings: [],
  theatres: [
    { id: 1, name: 'PVR Cinemas - Juhu', city: 'Mumbai', location: 'Juhu, Mumbai' },
    { id: 2, name: 'INOX - Lower Parel', city: 'Mumbai', location: 'Phoenix Mills, Lower Parel' },
    { id: 3, name: 'Carnival Cinemas', city: 'Mumbai', location: 'Borivali West, Mumbai' },
    { id: 4, name: 'PVR - Select Citywalk', city: 'Delhi-NCR', location: 'Saket, Delhi' },
    { id: 5, name: 'INOX - Nehru Place', city: 'Delhi-NCR', location: 'Nehru Place, Delhi' },
    { id: 6, name: 'PVR - Phoenix Marketcity', city: 'Bengaluru', location: 'Whitefield, Bengaluru' },
    { id: 7, name: 'INOX - Garuda Mall', city: 'Bengaluru', location: 'Magrath Road, Bengaluru' },
    { id: 8, name: 'AMB Cinemas', city: 'Hyderabad', location: 'Gachibowli, Hyderabad' },
    { id: 9, name: 'PVR - Banjara Hills', city: 'Hyderabad', location: 'Banjara Hills, Hyderabad' },
    { id: 10, name: 'Sathyam Cinemas', city: 'Chennai', location: 'Royapettah, Chennai' },
    { id: 11, name: 'PVR - VR Chennai', city: 'Chennai', location: 'Anna Salai, Chennai' },
    { id: 12, name: 'INOX - Lulu Mall', city: 'Kochi', location: 'Edapally, Kochi' },
    { id: 13, name: 'PVR - Centre Square Mall', city: 'Kochi', location: 'MG Road, Kochi' },
    { id: 14, name: 'Cinepolis - Ahmedabad', city: 'Ahmedabad', location: 'Iskon Mega Mall, Ahmedabad' },
    { id: 15, name: 'INOX - Alpha One', city: 'Ahmedabad', location: 'Vastrapur, Ahmedabad' },
    { id: 16, name: 'INOX - E Square', city: 'Pune', location: 'University Road, Pune' },
    { id: 17, name: 'PVR - Phoenix Marketcity Pune', city: 'Pune', location: 'Nagar Road, Pune' },
    { id: 18, name: 'INOX - South City', city: 'Kolkata', location: 'Prince Anwar Shah Road, Kolkata' },
    { id: 19, name: 'Cinepolis - Quest Mall', city: 'Kolkata', location: 'Park Circus, Kolkata' },
    { id: 20, name: 'INOX - Elante Mall', city: 'Chandigarh', location: 'Industrial Area, Chandigarh' }
  ],
  shows: [
    { id: 1, movie_id: 'M1', theatre_id: 1, show_times: ['10:00 AM', '1:30 PM', '5:00 PM', '9:00 PM'] },
    { id: 2, movie_id: 'M1', theatre_id: 2, show_times: ['11:00 AM', '3:00 PM', '7:00 PM'] },
    { id: 3, movie_id: 'M2', theatre_id: 1, show_times: ['10:30 AM', '2:00 PM', '6:30 PM'] },
    { id: 4, movie_id: 'M2', theatre_id: 3, show_times: ['12:00 PM', '4:00 PM', '8:00 PM'] },
    { id: 5, movie_id: 'M3', theatre_id: 4, show_times: ['9:30 AM', '1:00 PM', '5:30 PM', '9:30 PM'] },
    { id: 6, movie_id: 'M3', theatre_id: 5, show_times: ['11:00 AM', '3:30 PM', '7:30 PM'] },
    { id: 7, movie_id: 'M4', theatre_id: 6, show_times: ['10:00 AM', '2:30 PM', '6:00 PM', '9:45 PM'] },
    { id: 8, movie_id: 'M4', theatre_id: 7, show_times: ['12:30 PM', '4:30 PM', '8:30 PM'] },
    { id: 9, movie_id: 'M5', theatre_id: 8, show_times: ['10:00 AM', '2:00 PM', '6:00 PM', '10:00 PM'] },
    { id: 10, movie_id: 'M5', theatre_id: 9, show_times: ['11:30 AM', '3:30 PM', '7:30 PM'] },
    { id: 11, movie_id: 'M6', theatre_id: 10, show_times: ['9:00 AM', '1:00 PM', '5:00 PM', '9:00 PM'] },
    { id: 12, movie_id: 'M6', theatre_id: 11, show_times: ['11:00 AM', '3:00 PM', '7:00 PM'] },
    { id: 13, movie_id: 'M7', theatre_id: 12, show_times: ['10:00 AM', '2:00 PM', '6:00 PM', '9:30 PM'] },
    { id: 14, movie_id: 'M7', theatre_id: 13, show_times: ['12:00 PM', '4:00 PM', '8:00 PM'] },
    { id: 15, movie_id: 'M8', theatre_id: 14, show_times: ['10:30 AM', '2:30 PM', '6:30 PM', '10:00 PM'] },
    { id: 16, movie_id: 'M8', theatre_id: 15, show_times: ['1:00 PM', '5:00 PM', '9:00 PM'] },
    { id: 17, movie_id: 'M9', theatre_id: 16, show_times: ['10:00 AM', '1:30 PM', '5:30 PM', '9:30 PM'] },
    { id: 18, movie_id: 'M9', theatre_id: 17, show_times: ['11:00 AM', '3:00 PM', '7:00 PM'] },
    { id: 19, movie_id: 'M10', theatre_id: 18, show_times: ['9:30 AM', '2:00 PM', '6:00 PM', '9:45 PM'] },
    { id: 20, movie_id: 'M10', theatre_id: 19, show_times: ['12:00 PM', '4:30 PM', '8:30 PM'] },
    { id: 21, movie_id: 'M11', theatre_id: 20, show_times: ['10:00 AM', '2:00 PM', '6:00 PM', '10:00 PM'] }
  ],
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
  ],
  // ── Social Layer (additive, no impact on booking) ──────────────
  friend_requests: [],
  friendships: [],
  club_posts: [],
  club_votes: [],
  club_events: []
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
    let movies = db.data.movies;
    if (req.query.city) {
      const qCity = req.query.city.toLowerCase();
      movies = movies.filter(m => (m.cities || []).some(c => c.toLowerCase() === qCity));
    }
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== THEATRES API =====
app.get('/api/theatres', (req, res) => {
  try {
    const { movie_id, city } = req.query;
    let theatres = db.data.theatres || [];
    if (city) {
      theatres = theatres.filter(t => t.city.toLowerCase() === city.toLowerCase());
    }
    if (movie_id) {
      const showTheatreIds = (db.data.shows || []).filter(s => s.movie_id === movie_id).map(s => s.theatre_id);
      theatres = theatres.filter(t => showTheatreIds.includes(t.id));
    }
    // Attach show_times for each theatre
    const result = theatres.map(t => {
      const show = (db.data.shows || []).find(s => s.theatre_id === t.id && (!movie_id || s.movie_id === movie_id));
      return { ...t, show_times: show ? show.show_times : [] };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ===== SHOWS API =====
app.get('/api/shows', (req, res) => {
  try {
    const { theatre_id, movie_id } = req.query;
    let shows = db.data.shows || [];
    if (theatre_id) shows = shows.filter(s => s.theatre_id === parseInt(theatre_id));
    if (movie_id) shows = shows.filter(s => s.movie_id === movie_id);
    res.json(shows);
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

// ============================================================
// ===== SOCIAL LAYER — Additive module, no booking impact ====
// ============================================================

const newId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// ── Friend Requests ──────────────────────────────────────────

// Send a friend request
app.post('/api/social/friends/request', authenticateToken, async (req, res) => {
  try {
    if (!db.data.friend_requests) db.data.friend_requests = [];
    if (!db.data.friendships) db.data.friendships = [];

    const { to_user_id } = req.body;
    const fromId = req.user.id;
    if (fromId === to_user_id) return res.status(400).json({ message: "Cannot add yourself" });

    const alreadyFriends = db.data.friendships.some(f =>
      (f.user_a_id === fromId && f.user_b_id === to_user_id) ||
      (f.user_a_id === to_user_id && f.user_b_id === fromId)
    );
    if (alreadyFriends) return res.status(400).json({ message: 'Already friends' });

    const existing = db.data.friend_requests.find(r =>
      r.from_user_id === fromId && r.to_user_id === to_user_id && r.status === 'pending'
    );
    if (existing) return res.status(400).json({ message: 'Request already sent' });

    const req_obj = { id: newId(), from_user_id: fromId, to_user_id, status: 'pending', created_at: new Date() };
    db.data.friend_requests.push(req_obj);
    await db.write();
    res.json({ message: 'Friend request sent', request: req_obj });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Accept or reject a friend request
app.put('/api/social/friends/request/:id', authenticateToken, async (req, res) => {
  try {
    if (!db.data.friend_requests) db.data.friend_requests = [];
    if (!db.data.friendships) db.data.friendships = [];
    const { action } = req.body; // 'accepted' | 'rejected'
    const fr = db.data.friend_requests.find(r => r.id === req.params.id && r.to_user_id === req.user.id);
    if (!fr) return res.status(404).json({ message: 'Request not found' });

    fr.status = action;
    if (action === 'accepted') {
      db.data.friendships.push({ id: newId(), user_a_id: fr.from_user_id, user_b_id: fr.to_user_id, created_at: new Date() });
    }
    await db.write();
    res.json({ message: `Request ${action}`, request: fr });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get friends list for a user
app.get('/api/social/friends/:userId', authenticateToken, (req, res) => {
  try {
    if (!db.data.friendships) return res.json([]);
    const uid = parseInt(req.params.userId);
    const friendships = db.data.friendships.filter(f => f.user_a_id === uid || f.user_b_id === uid);
    const friendIds = friendships.map(f => f.user_a_id === uid ? f.user_b_id : f.user_a_id);
    const friends = db.data.users.filter(u => friendIds.includes(u.id)).map(({ password, ...u }) => u);
    res.json(friends);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get pending friend requests for current user
app.get('/api/social/friends/:userId/requests', authenticateToken, (req, res) => {
  try {
    if (!db.data.friend_requests) return res.json([]);
    const uid = parseInt(req.params.userId);
    const pending = db.data.friend_requests.filter(r => r.to_user_id === uid && r.status === 'pending');
    res.json(pending);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Remove a friend
app.delete('/api/social/friends/:friendshipId', authenticateToken, async (req, res) => {
  try {
    if (!db.data.friendships) return res.json({ message: 'Done' });
    db.data.friendships = db.data.friendships.filter(f => f.id !== req.params.friendshipId);
    await db.write();
    res.json({ message: 'Friend removed' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Friend activity (bookings feed)
app.get('/api/social/friends/:userId/activity', authenticateToken, (req, res) => {
  try {
    if (!db.data.friendships || !db.data.bookings) return res.json([]);
    const uid = parseInt(req.params.userId);
    const friendships = db.data.friendships.filter(f => f.user_a_id === uid || f.user_b_id === uid);
    const friendIds = friendships.map(f => f.user_a_id === uid ? f.user_b_id : f.user_a_id);
    const activity = db.data.bookings
      .filter(b => friendIds.includes(b.user_id))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 20)
      .map(b => {
        const user = db.data.users.find(u => u.id === b.user_id);
        return { ...b, friend_name: user ? user.name : 'Unknown' };
      });
    res.json(activity);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Club Posts / Discussion ──────────────────────────────────

// Get posts for a club
app.get('/api/social/clubs/:clubId/posts', (req, res) => {
  try {
    if (!db.data.club_posts) return res.json([]);
    const posts = db.data.club_posts
      .filter(p => p.club_id === req.params.clubId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(posts);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create a club post
app.post('/api/social/clubs/:clubId/posts', authenticateToken, async (req, res) => {
  try {
    if (!db.data.club_posts) db.data.club_posts = [];
    const post = {
      id: newId(),
      club_id: req.params.clubId,
      author_id: req.user.id,
      author_name: req.user.name,
      content: req.body.content,
      likes: [],
      created_at: new Date()
    };
    db.data.club_posts.push(post);
    await db.write();
    res.json(post);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Like / unlike a post
app.post('/api/social/clubs/:clubId/posts/:postId/like', authenticateToken, async (req, res) => {
  try {
    if (!db.data.club_posts) return res.status(404).json({ message: 'Post not found' });
    const post = db.data.club_posts.find(p => p.id === req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.likes = post.likes || [];
    const idx = post.likes.indexOf(req.user.id);
    if (idx === -1) post.likes.push(req.user.id);
    else post.likes.splice(idx, 1);
    await db.write();
    res.json(post);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete a post
app.delete('/api/social/clubs/:clubId/posts/:postId', authenticateToken, async (req, res) => {
  try {
    if (!db.data.club_posts) return res.json({ message: 'Done' });
    db.data.club_posts = db.data.club_posts.filter(p => !(p.id === req.params.postId && p.author_id === req.user.id));
    await db.write();
    res.json({ message: 'Post deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Movie Voting ─────────────────────────────────────────────

// Create a vote poll
app.post('/api/social/clubs/:clubId/votes', authenticateToken, async (req, res) => {
  try {
    if (!db.data.club_votes) db.data.club_votes = [];
    const { question, options, closes_at } = req.body;
    const vote = {
      id: newId(),
      club_id: req.params.clubId,
      created_by: req.user.id,
      question,
      options: (options || []).map(label => ({ label, votes: [] })),
      closes_at: closes_at || null,
      created_at: new Date()
    };
    db.data.club_votes.push(vote);
    await db.write();
    res.json(vote);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get polls for a club
app.get('/api/social/clubs/:clubId/votes', (req, res) => {
  try {
    if (!db.data.club_votes) return res.json([]);
    const votes = db.data.club_votes
      .filter(v => v.club_id === req.params.clubId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(votes);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Cast a vote
app.post('/api/social/clubs/:clubId/votes/:voteId/cast', authenticateToken, async (req, res) => {
  try {
    if (!db.data.club_votes) return res.status(404).json({ message: 'Poll not found' });
    const vote = db.data.club_votes.find(v => v.id === req.params.voteId);
    if (!vote) return res.status(404).json({ message: 'Poll not found' });
    // Remove user from all options first (one vote per person)
    vote.options.forEach(opt => { opt.votes = opt.votes.filter(id => id !== req.user.id); });
    const opt = vote.options[req.body.option_index];
    if (!opt) return res.status(400).json({ message: 'Invalid option' });
    opt.votes.push(req.user.id);
    await db.write();
    res.json(vote);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Club Events ──────────────────────────────────────────────

// Create an event
app.post('/api/social/clubs/:clubId/events', authenticateToken, async (req, res) => {
  try {
    if (!db.data.club_events) db.data.club_events = [];
    const event = {
      id: newId(),
      club_id: req.params.clubId,
      created_by: req.user.id,
      title: req.body.title,
      movie_id: req.body.movie_id,
      scheduled_at: req.body.scheduled_at,
      location: req.body.location,
      rsvps: { [req.user.id]: 'going' },
      created_at: new Date()
    };
    db.data.club_events.push(event);
    await db.write();
    res.json(event);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get events for a club
app.get('/api/social/clubs/:clubId/events', (req, res) => {
  try {
    if (!db.data.club_events) return res.json([]);
    const events = db.data.club_events
      .filter(e => e.club_id === req.params.clubId)
      .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    res.json(events);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// RSVP to an event
app.post('/api/social/clubs/:clubId/events/:eventId/rsvp', authenticateToken, async (req, res) => {
  try {
    if (!db.data.club_events) return res.status(404).json({ message: 'Event not found' });
    const event = db.data.club_events.find(e => e.id === req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    event.rsvps = event.rsvps || {};
    event.rsvps[req.user.id] = req.body.status; // 'going' | 'not_going'
    await db.write();
    res.json(event);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================================

const PORT = 3001; // API runs on 3001 to avoid conflict with Vite
server.listen(PORT, () => {
  console.log(`Persistent API server running on http://localhost:${PORT}`);
});