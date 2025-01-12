const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const authorize = require('../middlewares/authorize');
const PRIVILEGES = require('../constants/privileges');

// Ruta pública para login
router.post('/login', usuariosController.login);

// Ruta para verificar token (útil para mantener sesiones)
router.get('/verify-token', 
    authorize(), // Sin permiso específico, solo verifica el token
    usuariosController.verifyToken
);

// Rutas protegidas que requieren autenticación y permisos específicos
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

// Ruta para cambiar el código del usuario autenticado
router.post('/change-password',
    authorize(), // Solo requiere autenticación, sin permiso específico
    usuariosController.changePassword
);

// Ruta para obtener el usuario actual
router.get('/me',
    authorize(),
    (req, res) => {
        res.json(req.user);
    }
);

module.exports = router;