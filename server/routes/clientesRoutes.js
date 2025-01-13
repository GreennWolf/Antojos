// routes/clientesRoutes.js
const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const authorize = require('../middlewares/authorize');
const  PRIVILEGES  = require('../constants/privileges');

router.post('/', 
   authorize(PRIVILEGES.CLIENTES.CREATE), 
   clientesController.create
);

router.get('/', 
   authorize(PRIVILEGES.CLIENTES.READ), 
   clientesController.getAll
);

router.get('/search', 
   authorize(PRIVILEGES.CLIENTES.READ), 
   clientesController.search
);

router.get('/nif/:nif', 
   authorize(PRIVILEGES.CLIENTES.READ), 
   clientesController.getByNif
);

router.get('/:id', 
   authorize(PRIVILEGES.CLIENTES.READ), 
   clientesController.getById
);

router.put('/:id', 
   authorize(PRIVILEGES.CLIENTES.UPDATE), 
   clientesController.update
);

router.delete('/:id', 
   authorize(PRIVILEGES.CLIENTES.DELETE), 
   clientesController.delete
);

module.exports = router;