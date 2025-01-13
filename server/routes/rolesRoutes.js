// routes/rolesRoutes.js
const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');
const authorize = require('../middlewares/authorize');
const PRIVILEGES  = require('../constants/privileges');


router.get('/privileges/all',
   rolesController.getPrivileges
);

router.post('/', 
   authorize(PRIVILEGES.ROLES.CREATE), 
   rolesController.create
);

router.get('/', 
   authorize(PRIVILEGES.ROLES.READ), 
   rolesController.getAll
);

router.get('/:id', 
   authorize(PRIVILEGES.ROLES.READ), 
   rolesController.getById
);

router.put('/:id', 
   authorize(PRIVILEGES.ROLES.UPDATE), 
   rolesController.update
);

router.delete('/:id', 
   authorize(PRIVILEGES.ROLES.DELETE), 
   rolesController.delete
);

router.patch('/:id/permisos',
   authorize(PRIVILEGES.ROLES.UPDATE),
   rolesController.updatePermissions
);

router.patch('/:id/toggle',
   authorize(PRIVILEGES.ROLES.UPDATE),
   rolesController.toggleActive
);



module.exports = router;