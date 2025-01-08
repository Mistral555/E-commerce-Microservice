const express = require('express');
const communicator = require('../communicator/index'); // Update with correct path
const app = express();
const PORT = process.env.PORT || 3003;

// Middleware to parse JSON requests
app.use(express.json());

// Mock database for products
const products = [
  { id: 1, name: 'Product A' },
  { id: 2, name: 'Product B' },
  { id: 3, name: 'Product C' }
];

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    res.json({ products });
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get a product by ID
app.get('/api/products/:id', async (req, res) => {
  const productId = parseInt(req.params.id);

  try {
    const product = products.find(product => product.id === productId);

    if (product) {
      res.json({ product });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (err) {
    console.error('Error fetching product:', err.message);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Add a new product
app.post('/api/products', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const newProduct = {
      id: products.length + 1,
      name
    };
    products.push(newProduct);

    // Notify other services about the new product if needed
    await communicator.notifyNewProduct(newProduct);

    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (err) {
    console.error('Error adding product:', err.message);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Update an existing product
app.put('/api/products/:id', async (req, res) => {
  const productId = parseInt(req.params.id);
  const { name } = req.body;

  try {
    const product = products.find(product => product.id === productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (name) product.name = name;

    res.json({ message: 'Product updated successfully', product });
  } catch (err) {
    console.error('Error updating product:', err.message);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
  const productId = parseInt(req.params.id);

  try {
    const productIndex = products.findIndex(product => product.id === productId);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const removedProduct = products.splice(productIndex, 1);

    // Notify other services about the removed product if needed
    await communicator.notifyProductRemoval(removedProduct);

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err.message);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.listen(PORT, () => {
  console.log(`Product Service is running on port ${PORT}`);
});
