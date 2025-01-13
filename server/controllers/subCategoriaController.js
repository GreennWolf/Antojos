// controllers/subCategoriasController.js
const SubCategorias = require('../database/models/SubCategoriasModel');

const subCategoriaController = {
   create: async (req, res) => {
       try {
           const subCategoria = new SubCategorias(req.body);
           await subCategoria.save();
           res.status(201).json(subCategoria);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   getAll: async (req, res) => {
       try {
           const subCategorias = await SubCategorias.find()
               .populate('categoria')
               .populate('ingredientesPermitidos');
           res.json(subCategorias);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   getById: async (req, res) => {
       try {
           const subCategoria = await SubCategorias.findById(req.params.id)
               .populate('categoria')
               .populate('ingredientesPermitidos');
           if (!subCategoria) return res.status(404).json({ message: 'SubCategoría no encontrada' });
           res.json(subCategoria);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   update: async (req, res) => {
       try {
           const subCategoria = await SubCategorias.findByIdAndUpdate(
               req.params.id,
               req.body,
               { new: true }
           ).populate('categoria').populate('ingredientesPermitidos');
           
           if (!subCategoria) return res.status(404).json({ message: 'SubCategoría no encontrada' });
           res.json(subCategoria);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   delete: async (req, res) => {
       try {
           const subCategoria = await SubCategorias.findByIdAndDelete(req.params.id);
           if (!subCategoria) return res.status(404).json({ message: 'SubCategoría no encontrada' });
           res.json({ message: 'SubCategoría eliminada' });
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   toggleActive: async (req, res) => {
       try {
           const subCategoria = await SubCategorias.findById(req.params.id);
           if (!subCategoria) return res.status(404).json({ message: 'SubCategoría no encontrada' });
           await subCategoria.toggleActive();
           res.json(subCategoria);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   addIngrediente: async (req, res) => {
       try {
           const subCategoria = await SubCategorias.findById(req.params.id);
           if (!subCategoria) return res.status(404).json({ message: 'SubCategoría no encontrada' });
           await subCategoria.addIngrediente(req.body.ingredienteId);
           res.json(subCategoria);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   removeIngrediente: async (req, res) => {
       try {
           const subCategoria = await SubCategorias.findById(req.params.id);
           if (!subCategoria) return res.status(404).json({ message: 'SubCategoría no encontrada' });
           await subCategoria.removeIngrediente(req.body.ingredienteId);
           res.json(subCategoria);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   }
};

module.exports = subCategoriaController;