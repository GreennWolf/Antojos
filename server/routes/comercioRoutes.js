// routes/comercioRoutes.js
const express = require('express');
const router = express.Router();
const comercioController = require('../controllers/comercioController');
const authorize = require('../middlewares/authorize');
const PRIVILEGES  = require('../constants/privileges');

// Configuración de multer para subida de logo
const multer = require('multer');
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
       cb(null, 'uploads/logos')
   },
   filename: (req, file, cb) => {
       cb(null, Date.now() + '-' + file.originalname)
   }
});
const upload = multer({ storage: storage });

router.post('/', 
   authorize(PRIVILEGES.COMERCIO.CREATE), 
   comercioController.create
);

router.get('/', 
   authorize(PRIVILEGES.COMERCIO.READ), 
   comercioController.get
);

router.put('/', 
   authorize(PRIVILEGES.COMERCIO.UPDATE), 
   comercioController.update
);

router.post('/logo',
   authorize(PRIVILEGES.COMERCIO.UPDATE),
   upload.single('logo'),
   comercioController.uploadLogo
);

module.exports = router;