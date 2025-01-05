// controllers/mesasController.js
const Mesas = require('../database/models/MesasModel');

const mesasController = {
   create: async (req, res) => {
       try {
           const mesa = new Mesas(req.body);
           await mesa.save();
           res.status(201).json(mesa);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   getAll: async (req, res) => {
       try {
           const mesas = await Mesas.find().populate('salon');
           res.json(mesas);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   getBySalon: async (req, res) => {
       try {
           const mesas = await Mesas.find({ 
               salon: req.params.salonId 
           }).populate('salon');
           res.json(mesas);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   getById: async (req, res) => {
       try {
           const mesa = await Mesas.findById(req.params.id).populate('salon');
           if (!mesa) return res.status(404).json({ message: 'Mesa no encontrada' });
           res.json(mesa);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   update: async (req, res) => {
       try {
           const mesa = await Mesas.findByIdAndUpdate(
               req.params.id,
               req.body,
               { new: true }
           ).populate('salon');
           if (!mesa) return res.status(404).json({ message: 'Mesa no encontrada' });
           res.json(mesa);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   delete: async (req, res) => {
       try {
           const mesa = await Mesas.findByIdAndDelete(req.params.id);
           if (!mesa) return res.status(404).json({ message: 'Mesa no encontrada' });
           res.json({ message: 'Mesa eliminada' });
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   toggleActive: async (req, res) => {
       try {
           const mesa = await Mesas.findById(req.params.id);
           if (!mesa) return res.status(404).json({ message: 'Mesa no encontrada' });
           await mesa.toggleActive();
           res.json(mesa);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   }
};

module.exports = mesasController;