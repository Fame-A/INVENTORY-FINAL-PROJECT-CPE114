require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');
const logger = require('./middleware/logger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const categoryRoutes = require('./routes/categories');
const supplierRoutes = require('./routes/suppliers');
const itemRoutes = require('./routes/items');

const app = express();
const PORT = process.env.PORT || 3000;

// Built-in middleware
app.use(express.json());

// Custom logger middleware
app.use(logger);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Inventory API is running.', version: '1.0.0' });
});

app.use('/categories', categoryRoutes);
app.use('/suppliers', supplierRoutes);
app.use('/items', itemRoutes);

// 404 catch-all (must be after all routes)
app.use(notFound);

// Global error handler (must be last, 4 params required)
app.use(errorHandler);

// Start server after DB sync
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully.');
    app.listen(PORT, () => {
      console.log(`Inventory API running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to the database:', err.message);
    process.exit(1);
  });
