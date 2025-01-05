// routes/usuariosRoutes.js
const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const authorize = require('../middlewares/authorize');
const PRIVILEGES  = require('../constants/privileges');

router.post('/login', usuariosController.login);

router.post('/', 
   authorize(PRIVILEGES.CUENTAS.CREATE), 
   usuariosController.create
);

router.get('/', 
   authorize(PRIVILEGES.CUENTAS.READ), 
   usuariosController.getAll
);

router.get('/:id', 
   authorize(PRIVILEGES.CUENTAS.READ), 
   usuariosController.getById
);

router.put('/:id', 
   authorize(PRIVILEGES.CUENTAS.UPDATE), 
   usuariosController.update
);

router.delete('/:id', 
   authorize(PRIVILEGES.CUENTAS.DELETE), 
   usuariosController.delete
);

router.patch('/:id/toggle', 
   authorize(PRIVILEGES.CUENTAS.UPDATE), 
   usuariosController.toggleActive
);

module.exports = router;