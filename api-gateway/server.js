require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3000;

// Définir les URLs des services
const SERVICES = {
  products: "http://localhost:3003/api/products",
  orders: "http://localhost:3004/api/orders",
  users: "http://localhost:3001/api/users",
  stores: "http://localhost:3002/api/stores",
  carts: "http://localhost:3005/api/carts",
  auth: "http://localhost:3006/api/auth",
};

// Middleware global
app.use(cors({ origin: '*' })); // Autoriser toutes les origines
app.use(morgan('dev')); // Journalisation des requêtes
app.use(express.json()); // Permettre de lire le corps des requêtes JSON

// Middleware de configuration du proxy
const proxyOptions = (target) => ({
  target,
  changeOrigin: true,
  logLevel: 'debug', // Log détaillé pour le débogage
  onError: (err, req, res) => {
    console.error(`Erreur de proxy pour le service ${target}:`, err.message);
    res.status(502).json({ error: "Service indisponible. Veuillez réessayer plus tard." });
  },
});

// Configurer les routes de proxy
Object.entries(SERVICES).forEach(([serviceName, serviceUrl]) => {
  app.use(`/${serviceName}`, createProxyMiddleware(proxyOptions(serviceUrl)));
});

// Endpoint de vérification de santé
app.get('/health', (req, res) => {
  res.json({
    status: "OK",
    message: "API Gateway opérationnel.",
    services: Object.keys(SERVICES),
  });
});

// Route par défaut pour l'API Gateway
app.get('/', (req, res) => {
  res.json({ message: "Bienvenue à l'API Gateway pour le projet e-Commerce SI3A." });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`API Gateway is running on port: ${port}`);
  console.log(`Services disponibles: ${Object.keys(SERVICES).join(', ')}`);
});
