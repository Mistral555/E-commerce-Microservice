const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("ecommerce", "ecommerce_user", "password", {
  host: "postgres",
  dialect: "postgres",
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

const Product = sequelize.define("Product", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_name: DataTypes.STRING,
});

const Order = sequelize.define("Order", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_name: DataTypes.STRING,
  client_name: DataTypes.STRING,
  quantity: DataTypes.INTEGER,
  status: DataTypes.STRING,
});

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom: DataTypes.STRING,
  mail: DataTypes.STRING,
});

const Subscriptions = sequelize.define("Subscriptions", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  routeKey: DataTypes.STRING,
  webhookUrl: DataTypes.STRING,
  // client_id: { type: DataTypes.INTEGER, references: { model: Order, key: "id" } },
  Status: DataTypes.STRING,
});

module.exports = { sequelize, Product, Order, DeliveryOrder, Subscriptions };