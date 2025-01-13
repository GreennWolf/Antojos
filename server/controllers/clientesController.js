// controllers/clientesController.js
const Clientes = require('../database/models/ClientesModels');

const clientesController = {
   create: async (req, res) => {
       try {
           const cliente = new Clientes(req.body);
           await cliente.save();
           res.status(201).json(cliente);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   getAll: async (req, res) => {
       try {
           const clientes = await Clientes.find();
           res.json(clientes);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   getById: async (req, res) => {
       try {
           const cliente = await Clientes.findById(req.params.id);
           if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
           res.json(cliente);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   update: async (req, res) => {
       try {
           const cliente = await Clientes.findByIdAndUpdate(
               req.params.id,
               req.body,
               { new: true, runValidators: true }
           );
           if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
           res.json(cliente);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   delete: async (req, res) => {
       try {
           const cliente = await Clientes.findByIdAndDelete(req.params.id);
           if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
           res.json({ message: 'Cliente eliminado' });
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   search: async (req, res) => {
       try {
           const searchQuery = req.query.q;
           const clientes = await Clientes.find(
               { $text: { $search: searchQuery } },
               { score: { $meta: "textScore" } }
           ).sort({ score: { $meta: "textScore" } });
           
           res.json(clientes);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   getByNif: async (req, res) => {
       try {
           const cliente = await Clientes.findOne({ nif: req.params.nif });
           if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
           res.json(cliente);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   }
};

module.exports = clientesController;