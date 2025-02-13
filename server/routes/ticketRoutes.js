// routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authorize = require('../middlewares/authorize');
const PRIVILEGES  = require('../constants/privileges');

// Obtener todos los tickets
router.get('/', 
   authorize(PRIVILEGES.TICKETS.VIEW),
   ticketController.getAll
);

// Modificar método de pago en ticket cerrado
router.patch('/metodo-pago',
   authorize(PRIVILEGES.TICKETS.MODIFY_METODO_PAGO),
   ticketController.modifyMetodoPago
);

// Crear factura A desde ticket
router.post('/factura-a',
   authorize(PRIVILEGES.TICKETS.CREATE_FACTURA_A),
   ticketController.createFacturaA
);


// Anular ticket
router.post('/anular',
   authorize(PRIVILEGES.TICKETS.CANCEL),
   ticketController.anularTicket
);

// Reabrir ticket (convertir a ticket temporal)
router.post('/reopen',
   authorize(PRIVILEGES.TICKETS.REOPEN),
   ticketController.reopen
);

module.exports = router;