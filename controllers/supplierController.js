const { Supplier, Item } = require('../models');

// GET /suppliers
const getAllSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.findAll();
    res.json(suppliers);
  } catch (err) {
    next(err);
  }
};

// GET /suppliers/:id
const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id, {
      include: [{ model: Item, as: 'items' }],
    });
    if (!supplier) {
      return res.status(404).json({ error: 'Not Found', message: `Supplier with id ${req.params.id} not found.` });
    }
    res.json(supplier);
  } catch (err) {
    next(err);
  }
};

// POST /suppliers
const createSupplier = async (req, res, next) => {
  try {
    const { name, contactEmail, phone, address } = req.body;
    if (!name || !contactEmail) {
      return res.status(400).json({ error: 'Validation Error', message: '\'name\' and \'contactEmail\' are required.' });
    }
    const supplier = await Supplier.create({ name, contactEmail, phone, address });
    res.status(201).json(supplier);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Validation Error', message: 'A supplier with that email already exists.' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation Error', message: err.errors.map(e => e.message).join(', ') });
    }
    next(err);
  }
};

// PUT /suppliers/:id
const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Not Found', message: `Supplier with id ${req.params.id} not found.` });
    }
    const { name, contactEmail, phone, address } = req.body;
    await supplier.update({ name, contactEmail, phone, address });
    res.json(supplier);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Validation Error', message: 'A supplier with that email already exists.' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation Error', message: err.errors.map(e => e.message).join(', ') });
    }
    next(err);
  }
};

// DELETE /suppliers/:id
const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Not Found', message: `Supplier with id ${req.params.id} not found.` });
    }
    await supplier.destroy();
    res.json({ message: `Supplier '${supplier.name}' deleted successfully.` });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier };
