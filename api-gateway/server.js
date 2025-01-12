require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Mock Authentication Middleware
app.use((req, res, next) => {
  const token = req.headers['authorization'];
  if (!token || token !== 'Bearer securetoken123') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Service Routes
const services = {
  users: 'http://localhost:3001/api',
  stores: 'http://localhost:3002/api',
  products: 'http://localhost:3003/api',
  orders: 'http://localhost:3004/api',
  carts: 'http://localhost:3005/api',
  auth: 'http://localhost:3006/api',
};

// Proxy Requests to Microservices
Object.entries(services).forEach(([serviceName, serviceUrl]) => {
  app.get(
    `/${serviceName}`,
    createProxyMiddleware({
      target: serviceUrl,
      changeOrigin: true,
    })
  );
});



// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ message: 'API Gateway is running', services: Object.keys(services) });
});

// Start the API Gateway
app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
