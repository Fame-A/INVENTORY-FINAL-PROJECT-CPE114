const { Category, Item } = require('../models');

// GET /categories
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

// GET /categories/:id
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Item, as: 'items' }],
    });
    if (!category) {
      return res.status(404).json({ error: 'Not Found', message: `Category with id ${req.params.id} not found.` });
    }
    res.json(category);
  } catch (err) {
    next(err);
  }
};

// POST /categories
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Validation Error', message: '\'name\' is required.' });
    }
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Validation Error', message: 'A category with that name already exists.' });
    }
    next(err);
  }
};

// PUT /categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Not Found', message: `Category with id ${req.params.id} not found.` });
    }
    const { name, description } = req.body;
    await category.update({ name, description });
    res.json(category);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Validation Error', message: 'A category with that name already exists.' });
    }
    next(err);
  }
};

// DELETE /categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Not Found', message: `Category with id ${req.params.id} not found.` });
    }
    await category.destroy();
    res.json({ message: `Category '${category.name}' deleted successfully.` });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
