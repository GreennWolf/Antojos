// routes/subCategoriasRoutes.js
const express = require('express');
const router = express.Router();
const subCategoriaController = require('../controllers/subCategoriaController');
const authorize = require('../middlewares/authorize');
const PRIVILEGES  = require('../constants/privileges');

router.post('/', 
   authorize(PRIVILEGES.SUBCATEGORIAS.CREATE), 
   subCategoriaController.create
);

router.get('/', 
   authorize(PRIVILEGES.SUBCATEGORIAS.READ), 
   subCategoriaController.getAll
);

router.get('/:id', 
   authorize(PRIVILEGES.SUBCATEGORIAS.READ), 
   subCategoriaController.getById
);

router.put('/:id', 
   authorize(PRIVILEGES.SUBCATEGORIAS.UPDATE), 
   subCategoriaController.update
);

router.delete('/:id', 
   authorize(PRIVILEGES.SUBCATEGORIAS.DELETE), 
   subCategoriaController.delete
);

router.patch('/:id/toggle', 
   authorize(PRIVILEGES.SUBCATEGORIAS.UPDATE), 
   subCategoriaController.toggleActive
);

router.post('/:id/ingredientes', 
   authorize(PRIVILEGES.SUBCATEGORIAS.UPDATE), 
   subCategoriaController.addIngrediente
);

router.delete('/:id/ingredientes', 
   authorize(PRIVILEGES.SUBCATEGORIAS.UPDATE), 
   subCategoriaController.removeIngrediente
);

module.exports = router;