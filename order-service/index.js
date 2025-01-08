const express = require('express');
const communicator = require('../communicator/index'); // Update with correct path
const app = express();
const PORT = process.env.PORT || 3004;

// Middleware to parse JSON requests
app.use(express.json());

// Mock database for orders
const orders = [
  {
    id: 1,
    user_id: 1,
    products: [
      { id: 1, product_id: 1, quantity: 2 },
      { id: 2, product_id: 2, quantity: 1 }
    ],
    total_price: 56
  }
];

// Get all orders
app.get('/api/orders', (req, res) => {
  res.json({ orders });
});

// Get an order by ID
app.get('/api/orders/:id', (req, res) => {
  const orderId = parseInt(req.params.id);
  const order = orders.find(order => order.id === orderId);

  if (order) {
    res.json({ order });
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Add a new order
app.post('/api/orders', async (req, res) => {
  const { user_id, products, total_price } = req.body;

  if (!user_id || !products || !total_price) {
    return res.status(400).json({ error: 'User ID, products, and total price are required' });
  }

  // Validate user via User Service
  try {
    const user = await communicator.getUserById(user_id);
    if (!user) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
  } catch (err) {
    console.error('Error validating user:', err.message);
    return res.status(500).json({ error: 'Failed to validate user' });
  }

  // Validate products via Product Service
  for (const item of products) {
    try {
      const product = await communicator.getProductById(item.product_id);
      if (!product) {
        return res.status(400).json({ error: `Invalid product ID: ${item.product_id}` });
      }
    } catch (err) {
      console.error(`Error validating product ${item.product_id}:`, err.message);
      return res.status(500).json({ error: 'Failed to validate product' });
    }
  }

  const newOrder = {
    id: orders.length + 1,
    user_id,
    products,
    total_price
  };
  orders.push(newOrder);

  res.status(201).json({ message: 'Order created successfully', order: newOrder });
});

// Update an existing order
app.put('/api/orders/:id', async (req, res) => {
  const orderId = parseInt(req.params.id);
  const { user_id, products, total_price } = req.body;

  const order = orders.find(order => order.id === orderId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (user_id) {
    try {
      const user = await communicator.getUserById(user_id);
      if (!user) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      order.user_id = user_id;
    } catch (err) {
      console.error('Error validating user:', err.message);
      return res.status(500).json({ error: 'Failed to validate user' });
    }
  }

  if (products) {
    for (const item of products) {
      try {
        const product = await communicator.getProductById(item.product_id);
        if (!product) {
          return res.status(400).json({ error: `Invalid product ID: ${item.product_id}` });
        }
      } catch (err) {
        console.error(`Error validating product ${item.product_id}:`, err.message);
        return res.status(500).json({ error: 'Failed to validate product' });
      }
    }
    order.products = products;
  }

  if (total_price != null) order.total_price = total_price;

  res.json({ message: 'Order updated successfully', order });
});

// Delete an order
app.delete('/api/orders/:id', (req, res) => {
  const orderId = parseInt(req.params.id);
  const orderIndex = orders.findIndex(order => order.id === orderId);

  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  orders.splice(orderIndex, 1);

  res.json({ message: 'Order deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`Order Service is running on port ${PORT}`);
});
