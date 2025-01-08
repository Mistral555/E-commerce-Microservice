const express = require('express');
const bcrypt = require('bcrypt');
const communicator = require('../communicator/index'); // Update with correct path
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse JSON requests
app.use(express.json());

// Mock database for users
const users = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', password: bcrypt.hashSync('password123', 10) },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', password: bcrypt.hashSync('securepassword', 10) }
];

// Get all users (without password for security reasons)
app.get('/api/users', (req, res) => {
  const usersWithoutPassword = users.map(({ password, ...user }) => user);
  res.json({ users: usersWithoutPassword });
});

// Get a user by ID (without password for security reasons)
app.get('/api/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const user = users.find(user => user.id === userId);

    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
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

    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword
    };
    users.push(newUser);

    // Notify other services about the new user if needed
    await communicator.notifyNewUser(newUser);

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
    const user = users.find(user => user.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);

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
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const removedUser = users.splice(userIndex, 1);

    // Notify other services about the removed user if needed
    await communicator.notifyUserRemoval(removedUser);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.listen(PORT, () => {
  console.log(`User Service is running on port ${PORT}`);
});
