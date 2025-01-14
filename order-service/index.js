const express = require('express');
const { sequelize, Order, OrderProduct } = require('./db.js');
const communicator = require('./communicator/index');
const cors = require('cors'); 


const app = express();
app.use(cors());
const PORT = process.env.PORT || 3004;

// Middleware to parse JSON requests
app.use(express.json());

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.findAll({ include: OrderProduct });
    res.json({ orders });
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get an order by ID
app.get('/api/orders/:id', async (req, res) => {
  const orderId = parseInt(req.params.id);

  try {
    const order = await Order.findByPk(orderId, { include: OrderProduct });

    if (order) {
      res.json({ order });
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (err) {
    console.error('Error fetching order:', err.message);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Add a new order
app.post('/api/orders', async (req, res) => {
  const { user_id, products, total_price } = req.body;

  if (!user_id || !products || !total_price) {
    return res.status(400).json({ error: 'User ID, products, and total price are required' });
  }

  try {
    const newOrder = await Order.create({ user_id, total_price });

    const orderProducts = products.map(product => ({
      order_id: newOrder.id,
      product_id: product.product_id,
      quantity: product.quantity
    }));

    await OrderProduct.bulkCreate(orderProducts);

    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (err) {
    console.error('Error adding order:', err.message);
    res.status(500).json({ error: 'Failed to add order' });
  }
});

// Update an existing order
app.put('/api/orders/:id', async (req, res) => {
  const orderId = parseInt(req.params.id);
  const { user_id, products, total_price } = req.body;

  try {
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (user_id) order.user_id = user_id;
    if (total_price != null) order.total_price = total_price;

    await order.save();

    if (products) {
      await OrderProduct.destroy({ where: { order_id: orderId } });

      const updatedProducts = products.map(product => ({
        order_id: orderId,
        product_id: product.product_id,
        quantity: product.quantity
      }));

      await OrderProduct.bulkCreate(updatedProducts);
    }

    res.json({ message: 'Order updated successfully', order });
  } catch (err) {
    console.error('Error updating order:', err.message);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Delete an order
app.delete('/api/orders/:id', async (req, res) => {
  const orderId = parseInt(req.params.id);

  try {
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await OrderProduct.destroy({ where: { order_id: orderId } });
    await order.destroy();

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Error deleting order:', err.message);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

app.listen(PORT, () => {
  console.log(`Order Service is running on port ${PORT}`);
});
