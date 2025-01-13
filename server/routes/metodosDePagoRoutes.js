// routes/metodosDePagoRoutes.js
const express = require('express');
const router = express.Router();
const metodosDePagoController = require('../controllers/metodosDePagoController');
const authorize = require('../middlewares/authorize');
const PRIVILEGES  = require('../constants/privileges');

router.post('/', 
   authorize(PRIVILEGES.METODOS_PAGO.CREATE), 
   metodosDePagoController.create
);

router.get('/', 
   authorize(PRIVILEGES.METODOS_PAGO.READ), 
   metodosDePagoController.getAll
);

router.get('/:id', 
   authorize(PRIVILEGES.METODOS_PAGO.READ), 
   metodosDePagoController.getById
);

router.put('/:id', 
   authorize(PRIVILEGES.METODOS_PAGO.UPDATE), 
   metodosDePagoController.update
);

router.delete('/:id', 
   authorize(PRIVILEGES.METODOS_PAGO.DELETE), 
   metodosDePagoController.delete
);

router.patch('/:id/toggle', 
   authorize(PRIVILEGES.METODOS_PAGO.UPDATE), 
   metodosDePagoController.toggleActive
);

module.exports = router;