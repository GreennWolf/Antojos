// routes/zonasRoutes.js
const express = require('express');
const router = express.Router();
const zonasController = require('../controllers/zonasController');
const authorize = require('../middlewares/authorize');
const PRIVILEGES = require('../constants/privileges');

router.post('/', 
   authorize(PRIVILEGES.ZONAS_IMPRESION.CREATE), 
   zonasController.create
);
router.get('/', 
   authorize(PRIVILEGES.ZONAS_IMPRESION.READ ), 
   zonasController.getAll
);

router.get('/:id', 
   authorize(PRIVILEGES.ZONAS_IMPRESION.READ), 
   zonasController.getById
);

router.put('/:id', 
   authorize(PRIVILEGES.ZONAS_IMPRESION.UPDATE), 
   zonasController.update
);

router.delete('/:id', 
   authorize(PRIVILEGES.ZONAS_IMPRESION.DELETE), 
   zonasController.delete
);

router.patch('/:id/toggle', 
   authorize(PRIVILEGES.ZONAS_IMPRESION.UPDATE), 
   zonasController.toggleActive
);

module.exports = router;