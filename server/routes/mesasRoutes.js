// routes/mesasRoutes.js
const express = require('express');
const router = express.Router();
const mesasController = require('../controllers/mesasController');
const authorize = require('../middlewares/authorize');
const PRIVILEGES = require('../constants/privileges');

router.post('/', 
   authorize(PRIVILEGES.MESAS.CREATE), 
   mesasController.create
);

router.get('/', 
   authorize(PRIVILEGES.MESAS.READ), 
   mesasController.getAll
);

router.get('/salon/:salonId', 
   authorize(PRIVILEGES.MESAS.READ), 
   mesasController.getBySalon
);

router.get('/:id', 
   authorize(PRIVILEGES.MESAS.READ), 
   mesasController.getById
);

router.put('/:id', 
   authorize(PRIVILEGES.MESAS.UPDATE), 
   mesasController.update
);

router.delete('/:id', 
   authorize(PRIVILEGES.MESAS.DELETE), 
   mesasController.delete
);

router.patch('/:id/toggle', 
   authorize(PRIVILEGES.MESAS.UPDATE), 
   mesasController.toggleActive
);

module.exports = router;