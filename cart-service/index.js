const express = require('express');
const { sequelize, Cart, CartItem } = require('./db.js');
const communicator = require('./communicator/index');

const cors = require('cors'); 


const app = express();

app.use(cors());
const PORT = process.env.PORT || 3005;

app.use(express.json());

// Get a user's cart
app.get('/api/carts/:user_id', async (req, res) => {
  const userId = parseInt(req.params.user_id);

  try {
    const cart = await Cart.findOne({
      where: { user_id: userId },
    });

    if (cart) {
      const items = await CartItem.findAll({
        where: { cart_id: cart.id }
      });
      res.json({ items });
    } else {
      res.status(404).json({ error: 'Cart not found for the specified user' });
    }
  } catch (err) {
    console.error('Error fetching cart:', err.message);
    res.status(500).json({ err });
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
      res.status(201).json({ item });
    } else {
     const newItem= await CartItem.create({ cart_id: cart.id, product_id, quantity });
      res.status(201).json({ newItem });
    }

    // const updatedCart = await Cart.findOne({
    //   where: { user_id: userId },
    //   include: CartItem
    // });

   // res.status(201).json({ cart: updatedCart });
  } catch (err) {
    console.error('Error adding item to cart:', err.message);
    res.status(500).json({ err });
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

// Vider le panier d'un utilisateur
app.delete('/api/carts/:user_id/items', async (req, res) => {
  const userId = parseInt(req.params.user_id);

  try {
    // Récupérer le panier de l'utilisateur
    const cart = await Cart.findOne({ where: { user_id: userId } });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found for the specified user' });
    }

    // Supprimer tous les articles du panier
    await CartItem.destroy({ where: { cart_id: cart.id } });

    res.status(200).json({ message: 'Cart emptied successfully' });
  } catch (err) {
    console.error('Error emptying cart:', err.message);
    res.status(500).json({ error: 'Failed to empty cart' });
  }
});


app.listen(PORT, () => {
  console.log(`Cart Service is running on port ${PORT}`);
});
