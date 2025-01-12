// routes/preCuentaRoutes.js
const express = require('express');
const router = express.Router();
const preCuentaController = require('../controllers/preCuentaController');
const authorize = require('../middlewares/authorize');
const PRIVILEGES = require('../constants/privileges');

// Obtener todas las precuentas
router.get('/', 
   authorize(PRIVILEGES.TICKETS_TEMP.READ),
   preCuentaController.getAllPreCuentas
);

// Cambiar método de pago
router.patch('/metodo-pago', 
   authorize(PRIVILEGES.TICKETS_TEMP.MODIFY_METODO_PAGO),
   preCuentaController.changeMetodoPago
);

// Reabrir mesa
router.post('/reopen', 
   authorize(PRIVILEGES.TICKETS.REOPEN),
   preCuentaController.reOpen
);

// Imprimir ticket final
router.post('/imprimir', 
   authorize(PRIVILEGES.TICKETS.REPRINT),
   preCuentaController.imprimirTicket
);

module.exports = router;