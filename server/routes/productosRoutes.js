// routes/productosRoutes.js
const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const authorize = require('../middlewares/authorize');
const PRIVILEGES = require('../constants/privileges');

// Configuración de multer para subida de imágenes
const multer = require('multer');
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
       cb(null, 'uploads/productos')
   },
   filename: (req, file, cb) => {
       cb(null, Date.now() + '-' + file.originalname)
   }
});
const upload = multer({ storage: storage });

router.post('/', 
   authorize(PRIVILEGES.PRODUCTOS.CREATE), 
   productosController.create
);

router.get('/', 
   authorize(PRIVILEGES.PRODUCTOS.READ), 
   productosController.getAll
);

router.get('/search', 
   authorize(PRIVILEGES.PRODUCTOS.READ), 
   productosController.searchByNombre
);

router.get('/subcategoria/:subCategoriaId', 
   authorize(PRIVILEGES.PRODUCTOS.READ), 
   productosController.getBySubCategoria
);

router.get('/:id', 
   authorize(PRIVILEGES.PRODUCTOS.READ), 
   productosController.getById
);

router.put('/:id', 
   authorize(PRIVILEGES.PRODUCTOS.UPDATE), 
   productosController.update
);

router.delete('/:id', 
   authorize(PRIVILEGES.PRODUCTOS.DELETE), 
   productosController.delete
);

router.patch('/:id/toggle', 
   authorize(PRIVILEGES.PRODUCTOS.UPDATE), 
   productosController.toggleActive
);

router.patch('/:id/stock', 
   authorize(PRIVILEGES.PRODUCTOS.UPDATE), 
   productosController.updateStock
);

module.exports = router;