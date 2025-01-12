const express = require('express');
const router = express.Router();
const comercioController = require('../controllers/comercioController');
const authorize = require('../middlewares/authorize');
const PRIVILEGES = require('../constants/privileges');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Crear la carpeta de uploads si no existe
const createUploadDirectories = () => {
    const uploadsDir = 'uploads';
    const logosDir = path.join(uploadsDir, 'logos');

    // Crear directorio uploads si no existe
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
    }

    // Crear directorio logos si no existe
    if (!fs.existsSync(logosDir)) {
        fs.mkdirSync(logosDir);
    }
};

// Crear directorios al iniciar la aplicación
createUploadDirectories();

// Configuración de multer para subida de logo
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const logosDir = 'uploads/logos';
        // Verificar/crear directorio justo antes de guardar
        createUploadDirectories();
        cb(null, logosDir);
    },
    filename: (req, file, cb) => {
        // Agregar validación de tipo de archivo
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Tipo de archivo no permitido'), null);
        }
        // Generar nombre único y mantener la extensión original
        const fileExt = file.originalname.split('.').pop();
        cb(null, `logo-${Date.now()}.${fileExt}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Validación adicional de archivos
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('El archivo debe ser una imagen'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5MB
    }
});

// Resto de las rutas...
router.post('/', 
    authorize(PRIVILEGES.COMERCIO.CREATE), 
    comercioController.createOrUpdate
);

router.get('/', 
    authorize(PRIVILEGES.COMERCIO.READ), 
    comercioController.get
);

router.post('/logo',
    authorize(PRIVILEGES.COMERCIO.UPDATE),
    upload.single('logo'),
    (error, req, res, next) => {
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ 
                    message: 'El archivo es demasiado grande. Máximo 5MB' 
                });
            }
            return res.status(400).json({ message: error.message });
        }
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        next();
    },
    comercioController.uploadLogo
);

module.exports = router;