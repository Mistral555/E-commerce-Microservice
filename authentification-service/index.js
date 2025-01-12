const express = require('express');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { sequelize, User } = require('../db.js');
const app = express();
const PORT = process.env.PORT || 3006;

// Middleware to parse JSON requests
app.use(express.json());

// Secret key for JWT
const SECRET_KEY = 'your_secret_key';

// Endpoint to register a new user
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword });

    res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, username: newUser.username } });
  } catch (err) {
    console.error('Error registering user:', err.message);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Endpoint to login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Error logging in:', err.message);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Endpoint to verify the JWT
app.get('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ message: 'Token is valid', user: decoded });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

app.listen(PORT, () => {
  console.log(`Authentication Service is running on port ${PORT}`);
});
