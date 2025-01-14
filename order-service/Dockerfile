# Use Node.js as the base image
FROM node:16

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the application's port
EXPOSE 3004

# Define the command to run the app
CMD ["node", "index.js"]
