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
  users: 'http://localhost:3001',
  stores: 'http://localhost:3002',
  products: 'http://localhost:3003',
  orders: 'http://localhost:3004',
  carts: 'http://localhost:3005',
  auth: 'http://localhost:3006',
};

// Proxy Requests to Microservices
// Object.entries(services).forEach(([serviceName, serviceUrl]) => {
//     app.use((req, res, next) => {
//         console.log(`Incoming request: ${req.method} ${req.url}`);
//         next();
//       });
//   app.use(
//     `/api/${serviceName}`,
//     createProxyMiddleware({
//       target: serviceUrl,
//       changeOrigin: true,
//      // pathRewrite: { [`^/api/${serviceName}`]: '' }, // Remove the base path
//     })
//   );
// });

app.get('/api/users', createProxyMiddleware({
  target: 'http://localhost:3001', // URL du service d'authentification
  changeOrigin: true,
}));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ message: 'API Gateway is running', services: Object.keys(services) });
});

// Start the API Gateway
app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
