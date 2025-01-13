const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./database/db');
const config = require('./config/config');
const path = require('path')    
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Conexión a la base de datos
(async () => {
    try {
        await connectDB();
        console.log('Database connected from server');
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
})();

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "img-src": ["'self'", "data:", "blob:"],
            },
        },
    })
);

// Routes
app.use('/api/categorias', require('./routes/categoriasRoutes'));
app.use('/api/subcategorias', require('./routes/subCategoriasRoutes'));
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
app.use('/api/precuentas', require('./routes/preCuentaRoutes'));

// Carpetas estáticas para uploads
app.use('/uploads/productos', express.static(path.join(__dirname,'uploads/productos')));
app.use('/uploads/ingredientes', express.static(path.join(__dirname,'uploads/ingredientes')));
app.use('/uploads/logos', express.static(path.join(__dirname,'uploads/logos')));

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Error del servidor' });
});

const PORT = config.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${config.NODE_ENV} mode`);
});

module.exports = app;
