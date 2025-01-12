FROM node:16
WORKDIR /app
ENV NODE_PATH=./
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3006
CMD ["npm", "start"]
