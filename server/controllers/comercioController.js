// controllers/comercioController.js
const Comercio = require('../database/models/ComercioModel');

const comercioController = {
   createOrUpdate: async (req, res) => {
       try {
           // Buscar si ya existe un comercio
           let comercio = await Comercio.findOne();

           if (comercio) {
               // Si existe, actualizar
               Object.assign(comercio, req.body);
               await comercio.save();
               return res.json(comercio);
           } else {
               // Si no existe, crear
               comercio = new Comercio(req.body);
               await comercio.save();
               return res.status(201).json(comercio);
           }
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   get: async (req, res) => {
       try {
           const comercio = await Comercio.findOne();
           if (!comercio) {
               // Si no existe, devolver un objeto vacío o estructura base
               return res.json({
                   nombre: '',
                   direccion: '',
                   telefono: '',
                   email: '',
                   rut: '',
                   logo: null,
                   // otros campos por defecto que necesites
               });
           }
           res.json(comercio);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   uploadLogo: async (req, res) => {
       try {
           let comercio = await Comercio.findOne();
           console.log(req.file , 'archivo')
           if (!comercio) {
               // Si no existe el comercio, crearlo con el logo
               comercio = new Comercio({
                   logo: req.file?.path
               });
           } else {
               // Si existe, actualizar el logo
               comercio.logo = req.file?.path;
           }



           if (!req.file) {
               return res.status(400).json({ message: 'No se ha proporcionado ningún archivo' });
           }

           await comercio.save();
           res.json(comercio);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   }
};

module.exports = comercioController;