const sequelize = require('../config/database');
const Category = require('./Category');
const Item = require('./Item');
const Supplier = require('./Supplier');
const ItemSupplier = require('./ItemSupplier');

// One-to-Many: Category has many Items
Category.hasMany(Item, { foreignKey: 'categoryId', as: 'items', onDelete: 'RESTRICT' });
Item.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Many-to-Many: Items <-> Suppliers through ItemSupplier
Item.belongsToMany(Supplier, { through: ItemSupplier, foreignKey: 'itemId', as: 'suppliers' });
Supplier.belongsToMany(Item, { through: ItemSupplier, foreignKey: 'supplierId', as: 'items' });

module.exports = { sequelize, Category, Item, Supplier, ItemSupplier };
