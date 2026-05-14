const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Using bcryptjs for maximum compatibility
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

// Use Docker DB if available, otherwise use local DB
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blogDB';
mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// --- DATABASE SCHEMAS ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  imageUrl: String,  // NEW: Optional image link
  videoUrl: String   // NEW: Optional video link
});
const Post = mongoose.model('Post', PostSchema);

// --- SECURITY MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Access Denied" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({ username: req.body.username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "Account created securely!" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed. Username might exist." });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ username: user.username }, JWT_SECRET);
    res.json({ token: token, message: "Logged in successfully" });
  } catch (error) {
    res.status(500).json({ message: "Login Error" });
  }
});

// --- POST ROUTES (CRUD) ---
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
      imageUrl: req.body.imageUrl, // NEW
      videoUrl: req.body.videoUrl  // NEW
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
        imageUrl: req.body.imageUrl, // <-- Added this
        videoUrl: req.body.videoUrl  // <-- Added this
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

app.listen(5000, () => console.log('🚀 Server securely running on Port 5000'));