'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StoreProduct extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  StoreProduct.init({
    store_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    price: DataTypes.DECIMAL,
    quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'StoreProduct',
  });
  return StoreProduct;
};