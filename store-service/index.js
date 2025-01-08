const express = require('express');
const communicator = require('../communicator/index'); // Update with correct path
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware to parse JSON requests
app.use(express.json());

// Mock database for stores and products
const stores = [
  {
    id: 1,
    name: 'Xiaomi',
    user_prop: 4,
    products: [
      { id: 1, name: 'Product A', price: 20, quantity: 600 },
      { id: 2, name: 'Product B', price: 50, quantity: 300 }
    ]
  }
];

// Get all stores
app.get('/api/stores', (req, res) => {
  res.json({ stores });
});

// Get a store by ID
app.get('/api/stores/:id', async (req, res) => {
  const storeId = parseInt(req.params.id);

  try {
    const store = stores.find(store => store.id === storeId);
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
  const { name, user_prop, products } = req.body;

  if (!name || !user_prop) {
    return res.status(400).json({ error: 'Name and user_prop are required' });
  }

  try {
    const newStore = {
      id: stores.length + 1,
      name,
      user_prop,
      products: products || []
    };
    stores.push(newStore);

    // Notify other services about the new store if needed
    await communicator.notifyNewStore(newStore);

    res.status(201).json({ message: 'Store added successfully', store: newStore });
  } catch (err) {
    console.error('Error adding store:', err.message);
    res.status(500).json({ error: 'Failed to add store' });
  }
});

// Update a store
app.put('/api/stores/:id', async (req, res) => {
  const storeId = parseInt(req.params.id);
  const { name, user_prop, products } = req.body;

  try {
    const store = stores.find(store => store.id === storeId);

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    if (name) store.name = name;
    if (user_prop) store.user_prop = user_prop;
    if (products) store.products = products;

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
    const storeIndex = stores.findIndex(store => store.id === storeId);

    if (storeIndex === -1) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const removedStore = stores.splice(storeIndex, 1);

    // Notify other services about the removed store if needed
    await communicator.notifyStoreRemoval(removedStore);

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
    const store = stores.find(store => store.id === storeId);

    if (store) {
      res.json({ products: store.products });
    } else {
      res.status(404).json({ error: 'Store not found' });
    }
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add a product to a store
app.post('/api/stores/:id/products', async (req, res) => {
  const storeId = parseInt(req.params.id);
  const { name, price, quantity } = req.body;

  try {
    const store = stores.find(store => store.id === storeId);

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    if (!name || !price || !quantity) {
      return res.status(400).json({ error: 'Name, price, and quantity are required' });
    }

    const newProduct = {
      id: store.products.length + 1,
      name,
      price,
      quantity
    };
    store.products.push(newProduct);

    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (err) {
    console.error('Error adding product:', err.message);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Delete a product from a store
app.delete('/api/stores/:storeId/products/:productId', async (req, res) => {
  const storeId = parseInt(req.params.storeId);
  const productId = parseInt(req.params.productId);

  try {
    const store = stores.find(store => store.id === storeId);

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const productIndex = store.products.findIndex(product => product.id === productId);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    store.products.splice(productIndex, 1);

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err.message);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.listen(PORT, () => {
  console.log(`Store Service is running on port ${PORT}`);
});
