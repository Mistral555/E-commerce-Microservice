const express = require('express');
const communicator = require('../communicator/index'); // Update with correct path
const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

const carts = [
  {
    id: 1,
    user_id: 1,
    items: [
      { id: 1, product_id: 1, quantity: 2 },
      { id: 2, product_id: 2, quantity: 1 }
    ]
  }
];

app.get('/api/carts/:user_id', async (req, res) => {
  const userId = parseInt(req.params.user_id);

  // Validate user existence via User Service
  try {
    const user = await communicator.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Error validating user:', err.message);
    return res.status(500).json({ error: 'Failed to validate user' });
  }

  const userCart = carts.find(cart => cart.user_id === userId);

  if (userCart) {
    res.json({ cart: userCart });
  } else {
    res.status(404).json({ error: 'Cart not found for the specified user' });
  }
});

app.post('/api/carts/:user_id/items', async (req, res) => {
  const userId = parseInt(req.params.user_id);
  const { product_id, quantity } = req.body;

  // Validate user existence via User Service
  try {
    const user = await communicator.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Error validating user:', err.message);
    return res.status(500).json({ error: 'Failed to validate user' });
  }

  // Validate product existence via Product Service
  try {
    const product = await communicator.getProductById(product_id);
    if (!product) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
  } catch (err) {
    console.error('Error validating product:', err.message);
    return res.status(500).json({ error: 'Failed to validate product' });
  }

  let userCart = carts.find(cart => cart.user_id === userId);

  if (!userCart) {
    userCart = { id: carts.length + 1, user_id: userId, items: [] };
    carts.push(userCart);
  }

  const item = userCart.items.find(item => item.product_id === product_id);
  if (item) {
    item.quantity += quantity;
  } else {
    userCart.items.push({ id: userCart.items.length + 1, product_id, quantity });
  }

  res.status(201).json({ cart: userCart });
});

app.delete('/api/carts/:user_id/items/:item_id', async (req, res) => {
  const userId = parseInt(req.params.user_id);
  const itemId = parseInt(req.params.item_id);

  // Validate user existence via User Service
  try {
    const user = await communicator.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Error validating user:', err.message);
    return res.status(500).json({ error: 'Failed to validate user' });
  }

  const userCart = carts.find(cart => cart.user_id === userId);

  if (userCart) {
    userCart.items = userCart.items.filter(item => item.id !== itemId);
    res.json({ cart: userCart });
  } else {
    res.status(404).json({ error: 'Cart not found for the specified user' });
  }
});

app.listen(PORT, () => {
  console.log(`Cart Service is running on port ${PORT}`);
});
