const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ItemSupplier = sequelize.define('ItemSupplier', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  itemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'items', key: 'id' },
  },
  supplierId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'suppliers', key: 'id' },
  },
  unitCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
}, {
  tableName: 'item_suppliers',
  timestamps: true,
});

module.exports = ItemSupplier;
