// controllers/metodosDePagoController.js
const MetodosDePago = require('../database/models/MetodosDePagoModel');

const metodosDePagoController = {
   create: async (req, res) => {
       try {
           const metodoPago = new MetodosDePago(req.body);
           await metodoPago.save();
           res.status(201).json(metodoPago);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   getAll: async (req, res) => {
       try {
           const metodosPago = await MetodosDePago.find();
           res.json(metodosPago);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   getById: async (req, res) => {
       try {
           const metodoPago = await MetodosDePago.findById(req.params.id);
           if (!metodoPago) return res.status(404).json({ message: 'Método de pago no encontrado' });
           res.json(metodoPago);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   update: async (req, res) => {
       try {
           const metodoPago = await MetodosDePago.findByIdAndUpdate(
               req.params.id,
               req.body,
               { new: true }
           );
           if (!metodoPago) return res.status(404).json({ message: 'Método de pago no encontrado' });
           res.json(metodoPago);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   delete: async (req, res) => {
       try {
           const metodoPago = await MetodosDePago.findByIdAndDelete(req.params.id);
           if (!metodoPago) return res.status(404).json({ message: 'Método de pago no encontrado' });
           res.json({ message: 'Método de pago eliminado' });
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   toggleActive: async (req, res) => {
       try {
           const metodoPago = await MetodosDePago.findById(req.params.id);
           if (!metodoPago) return res.status(404).json({ message: 'Método de pago no encontrado' });
           await metodoPago.toggleActive();
           res.json(metodoPago);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   }
};

module.exports = metodosDePagoController;