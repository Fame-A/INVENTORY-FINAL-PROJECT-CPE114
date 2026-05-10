const express = require('express');
const router = express.Router();
const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  assignSupplier,
  removeSupplier,
} = require('../controllers/itemController');

router.get('/', getAllItems);
router.get('/:id', getItemById);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

// Relationship endpoints
router.post('/:id/suppliers', assignSupplier);
router.delete('/:id/suppliers/:supplierId', removeSupplier);

module.exports = router;
