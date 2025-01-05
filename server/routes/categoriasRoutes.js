// routes/categoriasRoutes.js
const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriasController');
const authorize = require('../middlewares/authorize');
const PRIVILEGES  = require('../constants/privileges.js');

router.post('/', 
   authorize(PRIVILEGES.CATEGORIAS.CREATE), 
   categoriaController.create
);

router.get('/', 
   authorize(PRIVILEGES.CATEGORIAS.READ), 
   categoriaController.getAll
);

router.get('/:id', 
   authorize(PRIVILEGES.CATEGORIAS.READ), 
   categoriaController.getById
);

router.put('/:id', 
   authorize(PRIVILEGES.CATEGORIAS.UPDATE), 
   categoriaController.update
);

router.delete('/:id', 
   authorize(PRIVILEGES.CATEGORIAS.DELETE), 
   categoriaController.delete
);

router.patch('/:id/toggle', 
   authorize(PRIVILEGES.CATEGORIAS.UPDATE), 
   categoriaController.toggleActive
);

module.exports = router;