// controllers/zonasController.js
const Zonas = require('../database/models/ZonasModel');

const zonasController = {
   create: async (req, res) => {
       try {
           const zona = new Zonas(req.body);
           await zona.save();
           res.status(201).json(zona);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   getAll: async (req, res) => {
       try {
           const zonas = await Zonas.find();
           res.json(zonas);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   getById: async (req, res) => {
       try {
           const zona = await Zonas.findById(req.params.id);
           if (!zona) return res.status(404).json({ message: 'Zona no encontrada' });
           res.json(zona);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   update: async (req, res) => {
       try {
           const zona = await Zonas.findByIdAndUpdate(
               req.params.id,
               req.body,
               { new: true }
           );
           if (!zona) return res.status(404).json({ message: 'Zona no encontrada' });
           res.json(zona);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   delete: async (req, res) => {
       try {
           const zona = await Zonas.findByIdAndDelete(req.params.id);
           if (!zona) return res.status(404).json({ message: 'Zona no encontrada' });
           res.json({ message: 'Zona eliminada' });
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   toggleActive: async (req, res) => {
       try {
           const zona = await Zonas.findById(req.params.id);
           if (!zona) return res.status(404).json({ message: 'Zona no encontrada' });
           await zona.toggleActive();
           res.json(zona);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   }
};

module.exports = zonasController;