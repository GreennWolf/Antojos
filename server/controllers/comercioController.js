// controllers/comercioController.js
const Comercio = require('../database/models/ComercioModel');

const comercioController = {
   create: async (req, res) => {
       try {
           const comercio = new Comercio(req.body);
           await comercio.save();
           res.status(201).json(comercio);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   get: async (req, res) => {
       try {
           // Asumimos que solo habrá un comercio
           const comercio = await Comercio.findOne();
           if (!comercio) return res.status(404).json({ message: 'Datos del comercio no encontrados' });
           res.json(comercio);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   update: async (req, res) => {
       try {
           const comercio = await Comercio.findOne();
           if (!comercio) {
               return res.status(404).json({ message: 'Datos del comercio no encontrados' });
           }

           Object.assign(comercio, req.body);
           await comercio.save();
           res.json(comercio);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   uploadLogo: async (req, res) => {
       try {
           const comercio = await Comercio.findOne();
           if (!comercio) {
               return res.status(404).json({ message: 'Datos del comercio no encontrados' });
           }

           if (!req.file) {
               return res.status(400).json({ message: 'No se ha proporcionado ningún archivo' });
           }

           comercio.logo = req.file.path;
           await comercio.save();
           res.json(comercio);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   }
};

module.exports = comercioController;