// routes/salonesRoutes.js
const express = require('express');
const router = express.Router();
const salonesController = require('../controllers/salonesController');
const authorize = require('../middlewares/authorize');
const PRIVILEGES = require('../constants/privileges');

router.post('/', 
   authorize(PRIVILEGES.SALONES.CREATE), 
   salonesController.create
);

router.get('/', 
   authorize(PRIVILEGES.SALONES.READ), 
   salonesController.getAll
);

router.get('/:id', 
   authorize(PRIVILEGES.SALONES.READ), 
   salonesController.getById
);

router.put('/:id', 
   authorize(PRIVILEGES.SALONES.UPDATE), 
   salonesController.update
);

router.delete('/:id', 
   authorize(PRIVILEGES.SALONES.DELETE), 
   salonesController.delete
);

router.patch('/:id/toggle', 
   authorize(PRIVILEGES.SALONES.UPDATE), 
   salonesController.toggleActive
);

module.exports = router;