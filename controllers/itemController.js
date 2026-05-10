const { Item, Category, Supplier, ItemSupplier } = require('../models');

// GET /items
const getAllItems = async (req, res, next) => {
  try {
    const items = await Item.findAll({
      include: [{ model: Category, as: 'category' }],
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// GET /items/:id
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Supplier, as: 'suppliers', through: { attributes: ['unitCost'] } },
      ],
    });
    if (!item) {
      return res.status(404).json({ error: 'Not Found', message: `Item with id ${req.params.id} not found.` });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// POST /items
const createItem = async (req, res, next) => {
  try {
    const { name, sku, description, quantity, price, categoryId } = req.body;

    if (!name || !sku || price === undefined || !categoryId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: "'name', 'sku', 'price', and 'categoryId' are required.",
      });
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({ error: 'Validation Error', message: `Category with id ${categoryId} does not exist.` });
    }

    const item = await Item.create({ name, sku, description, quantity, price, categoryId });
    const full = await Item.findByPk(item.id, { include: [{ model: Category, as: 'category' }] });
    res.status(201).json(full);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Validation Error', message: 'An item with that SKU already exists.' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation Error', message: err.errors.map(e => e.message).join(', ') });
    }
    next(err);
  }
};

// PUT /items/:id
const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Not Found', message: `Item with id ${req.params.id} not found.` });
    }

    const { name, sku, description, quantity, price, categoryId } = req.body;

    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({ error: 'Validation Error', message: `Category with id ${categoryId} does not exist.` });
      }
    }

    await item.update({ name, sku, description, quantity, price, categoryId });
    const full = await Item.findByPk(item.id, { include: [{ model: Category, as: 'category' }] });
    res.json(full);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Validation Error', message: 'An item with that SKU already exists.' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation Error', message: err.errors.map(e => e.message).join(', ') });
    }
    next(err);
  }
};

// DELETE /items/:id
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Not Found', message: `Item with id ${req.params.id} not found.` });
    }
    await item.destroy();
    res.json({ message: `Item '${item.name}' deleted successfully.` });
  } catch (err) {
    next(err);
  }
};

// POST /items/:id/suppliers  — assign a supplier to an item
const assignSupplier = async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Not Found', message: `Item with id ${req.params.id} not found.` });
    }

    const { supplierId, unitCost } = req.body;
    if (!supplierId) {
      return res.status(400).json({ error: 'Validation Error', message: "'supplierId' is required." });
    }

    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      return res.status(404).json({ error: 'Not Found', message: `Supplier with id ${supplierId} not found.` });
    }

    const [record, created] = await ItemSupplier.findOrCreate({
      where: { itemId: item.id, supplierId },
      defaults: { unitCost },
    });

    if (!created) {
      await record.update({ unitCost });
    }

    const full = await Item.findByPk(item.id, {
      include: [{ model: Supplier, as: 'suppliers', through: { attributes: ['unitCost'] } }],
    });
    res.status(created ? 201 : 200).json({ message: created ? 'Supplier assigned.' : 'Supplier link updated.', item: full });
  } catch (err) {
    next(err);
  }
};

// DELETE /items/:id/suppliers/:supplierId  — remove a supplier from an item
const removeSupplier = async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Not Found', message: `Item with id ${req.params.id} not found.` });
    }

    const supplier = await Supplier.findByPk(req.params.supplierId);
    if (!supplier) {
      return res.status(404).json({ error: 'Not Found', message: `Supplier with id ${req.params.supplierId} not found.` });
    }

    const deleted = await ItemSupplier.destroy({
      where: { itemId: item.id, supplierId: req.params.supplierId },
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Not Found', message: 'This supplier is not linked to the item.' });
    }

    res.json({ message: `Supplier '${supplier.name}' removed from item '${item.name}'.` });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllItems, getItemById, createItem, updateItem, deleteItem, assignSupplier, removeSupplier };
