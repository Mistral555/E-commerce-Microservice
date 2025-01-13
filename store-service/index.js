const express = require('express');
const { sequelize, Store, StoreProduct, Product } = require('./db.js');
const communicator = require('./communicator/index');
const cors = require('cors'); 

const app = express();
app.use(cors()); 
const PORT = process.env.PORT || 3002;

// Middleware to parse JSON requests
app.use(express.json());

// Get all stores
app.get('/api/stores', async (req, res) => {
  try {
    const stores = await Store.findAll();
    res.json({ stores });
  } catch (err) {
    console.error('Error fetching stores:', err.message);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// Get a store by ID
app.get('/api/stores/:id', async (req, res) => {
  const storeId = parseInt(req.params.id);

  try {
    const store = await Store.findByPk(storeId, {
      include: [
        {
          model: StoreProduct,
          include: [Product]
        }
      ]
    });
    if (store) {
      res.json({ store });
    } else {
      res.status(404).json({ error: 'Store not found' });
    }
  } catch (err) {
    console.error('Error fetching store:', err.message);
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

// Add a new store
app.post('/api/stores', async (req, res) => {
  const { name, user_prop } = req.body;

  if (!name || !user_prop) {
    return res.status(400).json({ error: 'Name and user_prop are required' });
  }

  try {
    const newStore = await Store.create({ name, user_prop });
    res.status(201).json({ message: 'Store added successfully', store: newStore });
  } catch (err) {
    console.error('Error adding store:', err.message);
    res.status(500).json({ error: 'Failed to add store' });
  }
});

// Update a store
app.put('/api/stores/:id', async (req, res) => {
  const storeId = parseInt(req.params.id);
  const { name, user_prop } = req.body;

  try {
    const store = await Store.findByPk(storeId);

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    if (name) store.name = name;
    if (user_prop) store.user_prop = user_prop;

    await store.save();
    res.json({ message: 'Store updated successfully', store });
  } catch (err) {
    console.error('Error updating store:', err.message);
    res.status(500).json({ error: 'Failed to update store' });
  }
});

// Delete a store
app.delete('/api/stores/:id', async (req, res) => {
  const storeId = parseInt(req.params.id);

  try {
    const store = await Store.findByPk(storeId);

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    await store.destroy();
    res.json({ message: 'Store deleted successfully' });
  } catch (err) {
    console.error('Error deleting store:', err.message);
    res.status(500).json({ error: 'Failed to delete store' });
  }
});

// Get products of a store
app.get('/api/stores/:id/products', async (req, res) => {
  const storeId = parseInt(req.params.id);

  try {
    const products = await StoreProduct.findAll({
      where: { storeId },
      include: [Product]
    });

    res.json({ products });
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add a product to a store
app.post('/api/stores/:id/products', async (req, res) => {
  const storeId = parseInt(req.params.id);
  const { productId, price, quantity } = req.body;

  try {
    const store = await Store.findByPk(storeId);

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    if (!productId || !price || !quantity) {
      return res.status(400).json({ error: 'ProductId, price, and quantity are required' });
    }

    const newProduct = await StoreProduct.create({
      storeId,
      productId,
      price,
      quantity
    });

    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (err) {
    console.error('Error adding product:', err.message);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Delete a product from a store
app.delete('/api/stores/:storeId/products/:productId', async (req, res) => {
  const { storeId, productId } = req.params;

  try {
    const product = await StoreProduct.findOne({
      where: { storeId, productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.destroy();

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err.message);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.listen(PORT, () => {
  console.log(`Store Service is running on port ${PORT}`);
});
