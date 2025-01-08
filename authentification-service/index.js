const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const communicator = require('../communicator/index'); // Update with correct path
const app = express();
const PORT = process.env.PORT || 3006;

// Middleware to parse JSON requests
app.use(express.json());

// Mock user database
const users = [
  {
    id: 1,
    username: 'user1',
    password: bcrypt.hashSync('password123', 10), // Pre-hashed password
  }
];

// Secret key for JWT
const SECRET_KEY = 'your_secret_key';

// Endpoint to register a new user
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: users.length + 1, username, password: hashedPassword };
  users.push(newUser);

  // Synchronize with User Service
  try {
    await communicator.createUser({ username });
  } catch (err) {
    console.error('Error syncing with User Service:', err.message);
    return res.status(500).json({ error: 'Failed to synchronize user with User Service' });
  }

  res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, username: newUser.username } });
});

// Endpoint to login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Validate user with User Service
  let user;
  try {
    const response = await communicator.getUsers();
    user = response.users.find(u => u.username === username);
  } catch (err) {
    console.error('Error fetching users from User Service:', err.message);
    return res.status(500).json({ error: 'Failed to validate user with User Service' });
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ message: 'Login successful', token });
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
