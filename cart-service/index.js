const express = require('express');
const { sequelize, Cart, CartItem } = require('../db.js');
const communicator = require('../communicator/index');
const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

// Get a user's cart
app.get('/api/carts/:user_id', async (req, res) => {
  const userId = parseInt(req.params.user_id);

  try {
    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: CartItem
    });

    if (cart) {
      res.json({ cart });
    } else {
      res.status(404).json({ error: 'Cart not found for the specified user' });
    }
  } catch (err) {
    console.error('Error fetching cart:', err.message);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add an item to a user's cart
app.post('/api/carts/:user_id/items', async (req, res) => {
  const userId = parseInt(req.params.user_id);
  const { product_id, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ where: { user_id: userId } });

    if (!cart) {
      cart = await Cart.create({ user_id: userId });
    }

    const item = await CartItem.findOne({ where: { cart_id: cart.id, product_id } });

    if (item) {
      item.quantity += quantity;
      await item.save();
    } else {
      await CartItem.create({ cart_id: cart.id, product_id, quantity });
    }

    const updatedCart = await Cart.findOne({
      where: { user_id: userId },
      include: CartItem
    });

    res.status(201).json({ cart: updatedCart });
  } catch (err) {
    console.error('Error adding item to cart:', err.message);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Delete an item from a user's cart
app.delete('/api/carts/:user_id/items/:item_id', async (req, res) => {
  const userId = parseInt(req.params.user_id);
  const itemId = parseInt(req.params.item_id);

  try {
    const cart = await Cart.findOne({ where: { user_id: userId } });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found for the specified user' });
    }

    const item = await CartItem.findOne({ where: { id: itemId, cart_id: cart.id } });

    if (!item) {
      return res.status(404).json({ error: 'Item not found in the cart' });
    }

    await item.destroy();

    const updatedCart = await Cart.findOne({
      where: { user_id: userId },
      include: CartItem
    });

    res.json({ cart: updatedCart });
  } catch (err) {
    console.error('Error deleting item from cart:', err.message);
    res.status(500).json({ error: 'Failed to delete item from cart' });
  }
});

app.listen(PORT, () => {
  console.log(`Cart Service is running on port ${PORT}`);
});
