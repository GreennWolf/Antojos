// controllers/salonesController.js
const Salones = require('../database/models/SalonesModel');

const salonesController = {
   create: async (req, res) => {
       try {
           const salon = new Salones(req.body);
           await salon.save();
           res.status(201).json(salon);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   getAll: async (req, res) => {
       try {
           const salones = await Salones.find();
           res.json(salones);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   getById: async (req, res) => {
       try {
           const salon = await Salones.findById(req.params.id);
           if (!salon) return res.status(404).json({ message: 'Salón no encontrado' });
           res.json(salon);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   update: async (req, res) => {
       try {
           const salon = await Salones.findByIdAndUpdate(
               req.params.id,
               req.body,
               { new: true }
           );
           if (!salon) return res.status(404).json({ message: 'Salón no encontrado' });
           res.json(salon);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   delete: async (req, res) => {
       try {
           const salon = await Salones.findByIdAndDelete(req.params.id);
           if (!salon) return res.status(404).json({ message: 'Salón no encontrado' });
           res.json({ message: 'Salón eliminado' });
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   toggleActive: async (req, res) => {
       try {
           const salon = await Salones.findById(req.params.id);
           if (!salon) return res.status(404).json({ message: 'Salón no encontrado' });
           await salon.toggleActive();
           res.json(salon);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   }
};

module.exports = salonesController;