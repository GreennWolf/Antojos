// routes/TicketTempsRoutes.js
const express = require('express');
const router = express.Router();
const ticketsTempsController = require('../controllers/ticketsTempsController');
const authorize = require('../middlewares/authorize');
const PRIVILEGES  = require('../constants/privileges');

router.post(
    '/confirmar-pedido',
    authorize(PRIVILEGES.TICKETS_TEMP.CONFIRMAR_PEDIDO),
    ticketsTempsController.confirmarPedido
);

router.post(
    '/remove-producto',
    authorize(PRIVILEGES.TICKETS_TEMP.REMOVE_PRODUCTOS),
    ticketsTempsController.removeProducto
);

router.post(
    '/restar-cantidad',
    authorize(PRIVILEGES.TICKETS_TEMP.REMOVE_PRODUCTOS),
    ticketsTempsController.restarCantidad
);

router.post(
    '/apply-descuento',
    authorize(PRIVILEGES.TICKETS_TEMP.APPLY_DESCUENTO),
    ticketsTempsController.applyDescuento
);

router.get(
    '/mesa/:mesaId',
    authorize(PRIVILEGES.TICKETS_TEMP.CONFIRMAR_PEDIDO), // Usa el permiso de lectura de tickets temporales si es necesario
    ticketsTempsController.getByMesa
);

router.post(
    '/cerrar-mesa',
    authorize(PRIVILEGES.TICKETS_TEMP.CONFIRMAR_PEDIDO),
    ticketsTempsController.cerrarMesa
);

router.get(
    '/mesas-abiertas',
    authorize(PRIVILEGES.TICKETS_TEMP.CONFIRMAR_PEDIDO), // Puede ser reemplazado por otro permiso más específico
    ticketsTempsController.getAllMesasAbiertas
);

router.put(
    '/juntar',
    authorize(PRIVILEGES.TICKETS_TEMP.JOIN_MESAS), // Puede ser reemplazado por otro permiso más específico
    ticketsTempsController.juntarMesa
);

module.exports = router;
