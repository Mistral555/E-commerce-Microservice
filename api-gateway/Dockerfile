# Utiliser une image officielle Node.js
FROM node:16

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tous les fichiers du service
COPY . .

# Exposer le port pour le service (adapter si nécessaire)
EXPOSE 8080

# Commande pour démarrer le service
CMD ["npm", "start"]
