const axios = require('axios');

class Communicator {
  constructor() {
    this.userServiceClient = axios.create({ baseURL: 'http://localhost:3001/api' });
    this.storeServiceClient = axios.create({ baseURL: 'http://localhost:3002/api' });
    this.productServiceClient = axios.create({ baseURL: 'http://localhost:3003/api' });
    this.orderServiceClient = axios.create({ baseURL: 'http://localhost:3004/api' });
    this.cartServiceClient = axios.create({ baseURL: 'http://localhost:3005/api' });
    this.authServiceClient = axios.create({ baseURL: 'http://localhost:3006/api' });
  }

  // User Service methods
  async getUsers() {
    const response = await this.userServiceClient.get('/users');
    return response.data;
  }

  async getUserById(id) {
    const response = await this.userServiceClient.get(`/users/${id}`);
    return response.data;
  }

  async createUser(userData) {
    const response = await this.userServiceClient.post('/users', userData);
    return response.data;
  }

  async updateUser(id, userData) {
    const response = await this.userServiceClient.put(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id) {
    const response = await this.userServiceClient.delete(`/users/${id}`);
    return response.data;
  }

  // Product Service methods
  async getProducts() {
    const response = await this.productServiceClient.get('/products');
    return response.data;
  }

  async getProductById(id) {
    const response = await this.productServiceClient.get(`/products/${id}`);
    return response.data;
  }

  async createProduct(productData) {
    const response = await this.productServiceClient.post('/products', productData);
    return response.data;
  }

  async updateProduct(id, productData) {
    const response = await this.productServiceClient.put(`/products/${id}`, productData);
    return response.data;
  }

  async deleteProduct(id) {
    const response = await this.productServiceClient.delete(`/products/${id}`);
    return response.data;
  }

  // Order Service methods
  async getOrders() {
    const response = await this.orderServiceClient.get('/orders');
    return response.data;
  }

  async getOrderById(id) {
    const response = await this.orderServiceClient.get(`/orders/${id}`);
    return response.data;
  }

  async createOrder(orderData) {
    const response = await this.orderServiceClient.post('/orders', orderData);
    return response.data;
  }

  async updateOrder(id, orderData) {
    const response = await this.orderServiceClient.put(`/orders/${id}`, orderData);
    return response.data;
  }

  async deleteOrder(id) {
    const response = await this.orderServiceClient.delete(`/orders/${id}`);
    return response.data;
  }

  // Store Service methods
  async getStores() {
    const response = await this.storeServiceClient.get('/stores');
    return response.data;
  }

  async getStoreById(id) {
    const response = await this.storeServiceClient.get(`/stores/${id}`);
    return response.data;
  }

  async createStore(storeData) {
    const response = await this.storeServiceClient.post('/stores', storeData);
    return response.data;
  }

  async updateStore(id, storeData) {
    const response = await this.storeServiceClient.put(`/stores/${id}`, storeData);
    return response.data;
  }

  async deleteStore(id) {
    const response = await this.storeServiceClient.delete(`/stores/${id}`);
    return response.data;
  }

  // Cart Service methods
  async getCartByUserId(userId) {
    const response = await this.cartServiceClient.get(`/carts/${userId}`);
    return response.data;
  }

  async addItemToCart(userId, itemData) {
    const response = await this.cartServiceClient.post(`/carts/${userId}/items`, itemData);
    return response.data;
  }

  async deleteItemFromCart(userId, itemId) {
    const response = await this.cartServiceClient.delete(`/carts/${userId}/items/${itemId}`);
    return response.data;
  }

  // Auth Service methods
  async registerUser(authData) {
    const response = await this.authServiceClient.post('/auth/register', authData);
    return response.data;
  }

  async loginUser(authData) {
    const response = await this.authServiceClient.post('/auth/login', authData);
    return response.data;
  }

  async verifyToken(token) {
    const response = await this.authServiceClient.get('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
}

module.exports = new Communicator();
