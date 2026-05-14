const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

const app = express();

// --- 1. CORS FIRST (before everything) ---
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || origin.endsWith('.vercel.app') || origin === 'http://localhost:5173') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());

// --- 2. DATABASE CONNECTION ---
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blogDB';
mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- 3. SECURITY CONFIG ---
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_local_only';

// --- 4. DATABASE SCHEMAS ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  imageUrl: String,
  videoUrl: String
});
const Post = mongoose.model('Post', PostSchema);

// --- 5. AUTHENTICATION MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: "Access Denied: No Token Provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or Expired Token" });
    req.user = user;
    next();
  });
};

// --- 6. AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Username is already taken." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    
    console.log(`👤 New User Registered: ${username}`);
    res.status(201).json({ message: "Account created securely!" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log(`❌ Login failed: User ${username} not found`);
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log(`❌ Login failed: Incorrect password for ${username}`);
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    console.log(`✅ User Logged In: ${username}`);
    res.json({ token, message: "Logged in successfully" });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error during login" });
  }
});

// --- 7. POST ROUTES (CRUD) ---
app.get('/api/posts', authenticateToken, async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      author: req.user.username,
      imageUrl: req.body.imageUrl,
      videoUrl: req.body.videoUrl
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error creating post" });
  }
});

app.put('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author !== req.user.username) return res.status(403).json({ message: "Unauthorized" });

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { 
        title: req.body.title, 
        content: req.body.content,
        imageUrl: req.body.imageUrl,
        videoUrl: req.body.videoUrl
      },
      { new: true }
    );
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Error updating post" });
  }
});

app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author !== req.user.username) return res.status(403).json({ message: "Unauthorized" });

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post" });
  }
});

// --- 8. START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server securely running on Port ${PORT}`));