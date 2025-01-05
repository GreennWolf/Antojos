// routes/ingredientesRoutes.js
const express = require('express');
const router = express.Router();
const ingredientesController = require('../controllers/ingredientesController');
const authorize = require('../middlewares/authorize');
const PRIVILEGES  = require('../constants/privileges');

// Configuración de multer para subida de imágenes
const multer = require('multer');
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
       cb(null, 'uploads/ingredientes')
   },
   filename: (req, file, cb) => {
       cb(null, Date.now() + '-' + file.originalname)
   }
});
const upload = multer({ storage: storage });

router.post('/', 
   authorize(PRIVILEGES.INGREDIENTES.CREATE), 
   ingredientesController.create
);

router.get('/', 
   authorize(PRIVILEGES.INGREDIENTES.READ), 
   ingredientesController.getAll
);

router.get('/search', 
   authorize(PRIVILEGES.INGREDIENTES.READ), 
   ingredientesController.searchByNombre
);

router.get('/categoria/:categoriaId', 
   authorize(PRIVILEGES.INGREDIENTES.READ), 
   ingredientesController.getByCategoria
);

router.get('/:id', 
   authorize(PRIVILEGES.INGREDIENTES.READ), 
   ingredientesController.getById
);

router.put('/:id', 
   authorize(PRIVILEGES.INGREDIENTES.UPDATE), 
   ingredientesController.update
);

router.delete('/:id', 
   authorize(PRIVILEGES.INGREDIENTES.DELETE), 
   ingredientesController.delete
);

router.patch('/:id/toggle', 
   authorize(PRIVILEGES.INGREDIENTES.UPDATE), 
   ingredientesController.toggleActive
);

router.patch('/:id/stock', 
   authorize(PRIVILEGES.INGREDIENTES.UPDATE), 
   ingredientesController.updateStock
);

module.exports = router;