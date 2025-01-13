const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("ecommerce", "root", "password", {
  host: "db",
  dialect: "mysql",
  logging: console.log,
});

async function connectWithRetry() {
  try {
    await sequelize.authenticate();
    console.log("Connexion réussie à la base de données.");
  } catch (error) {
    console.error("Impossible de se connecter à la base de données:", error);
    console.log("Nouvelle tentative de connexion dans 5 secondes...");
    setTimeout(connectWithRetry, 5000);
  }
}

connectWithRetry();

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
});

const Product = sequelize.define("Product", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false }, // Nom du produit
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // Prix du produit
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, // Quantité en stock
});


const Store = sequelize.define("Store", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  user_prop: { type: DataTypes.INTEGER, references: { model: User, key: "id" } },
});

const StoreProduct = sequelize.define("StoreProduct", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  store_id: { type: DataTypes.INTEGER, references: { model: Store, key: "id" } },
  product_id: { type: DataTypes.INTEGER, references: { model: Product, key: "id" } },
  price: DataTypes.DECIMAL,
  quantity: DataTypes.INTEGER,
});

const Cart = sequelize.define("Cart", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, references: { model: User, key: "id" } },
});

const CartItem = sequelize.define("CartItem", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cart_id: { type: DataTypes.INTEGER, references: { model: Cart, key: "id" } },
  product_id: { type: DataTypes.INTEGER, references: { model: Product, key: "id" } },
  quantity: DataTypes.INTEGER,
});

const Order = sequelize.define("Order", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, references: { model: User, key: "id" } },
  total_price: DataTypes.DECIMAL,
});

const OrderProduct = sequelize.define("OrderProduct", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, references: { model: Order, key: "id" } },
  product_id: { type: DataTypes.INTEGER, references: { model: Product, key: "id" } },
  quantity: DataTypes.INTEGER,
});

async function syncDatabase() {
  try {
    await sequelize.sync({ force: false }); // force: true recréera les tables à chaque exécution (attention aux données).
    console.log("Base de données synchronisée avec succès !");
  } catch (error) {
    console.error("Erreur lors de la synchronisation de la base de données :", error);
  }
}

syncDatabase();


module.exports = { sequelize, User, Product, Store, StoreProduct, Cart, CartItem, Order, OrderProduct };
