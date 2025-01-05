// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./database/db');
const { PRIVILEGES } = require('./constants/privileges');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/categorias', require('./routes/categoriasRoutes'));
app.use('/api/subcategorias', require('./routes/subCategoriaRoutes'));
app.use('/api/salones', require('./routes/salonesRoutes'));
app.use('/api/mesas', require('./routes/mesasRoutes'));
app.use('/api/zonas', require('./routes/zonasRoutes'));
app.use('/api/clientes', require('./routes/clientesRoutes'));
app.use('/api/metodos-pago', require('./routes/metodosDePagoRoutes'));
app.use('/api/comercio', require('./routes/comercioRoutes'));
app.use('/api/productos', require('./routes/productosRoutes'));
app.use('/api/ingredientes', require('./routes/ingredientesRoutes'));
app.use('/api/usuarios', require('./routes/usuariosRoutes'));
app.use('/api/roles', require('./routes/rolesRoutes'));
app.use('/api/tickets-temp', require('./routes/ticketsTempsRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/precuentas', require('./routes/preCuentasRoutes'));

// Carpetas estáticas para uploads
app.use('/uploads/productos', express.static('uploads/productos'));
app.use('/uploads/ingredientes', express.static('uploads/ingredientes'));
app.use('/uploads/logos', express.static('uploads/logos'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});