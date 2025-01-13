const express = require('express');
const bcrypt = require('bcrypt');
const communicator = require('../communicator/index');
const { sequelize, User, Product } = require('../db.js');
const cors = require('cors'); 


const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

// Middleware to parse JSON requests
app.use(express.json());

// Get all users (without password for security reasons)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json({ users });
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get a user by ID (without password for security reasons)
app.get('/api/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });
    if (user) {
      res.json({ user });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Error fetching user:', err.message);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Add a new user
app.post('/api/users', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ message: 'User added successfully', user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  } catch (err) {
    console.error('Error adding user:', err.message);
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// Update an existing user
app.put('/api/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email, password } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    res.json({ message: 'User updated successfully', user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Error updating user:', err.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete a user
app.delete('/api/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.listen(PORT, () => {
  console.log(`User Service is running on port ${PORT}`);
});
