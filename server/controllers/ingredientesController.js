// controllers/ingredientesController.js
const Ingredientes = require('../database/models/IngredientesModel');

const ingredientesController = {
   create: async (req, res) => {
       try {
           const ingrediente = new Ingredientes({
               ...req.body,
               createdBy: req.user.id
           });
           await ingrediente.save();
           res.status(201).json(ingrediente);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   getAll: async (req, res) => {
       try {
           const ingredientes = await Ingredientes.find()
               .populate('categoria')
               .populate('ingredientes.ingrediente')
               .populate('createdBy', 'nombre');
           res.json(ingredientes);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   getById: async (req, res) => {
       try {
           const ingrediente = await Ingredientes.findById(req.params.id)
               .populate('categoria')
               .populate('ingredientes.ingrediente')
               .populate('createdBy', 'nombre');
           if (!ingrediente) return res.status(404).json({ message: 'Ingrediente no encontrado' });
           res.json(ingrediente);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   update: async (req, res) => {
       try {
           const ingrediente = await Ingredientes.findByIdAndUpdate(
               req.params.id,
               req.body,
               { new: true, runValidators: true }
           ).populate('categoria')
            .populate('ingredientes.ingrediente')
            .populate('createdBy', 'nombre');

           if (!ingrediente) return res.status(404).json({ message: 'Ingrediente no encontrado' });
           res.json(ingrediente);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   delete: async (req, res) => {
       try {
           const ingrediente = await Ingredientes.findByIdAndDelete(req.params.id);
           if (!ingrediente) return res.status(404).json({ message: 'Ingrediente no encontrado' });
           res.json({ message: 'Ingrediente eliminado' });
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   toggleActive: async (req, res) => {
       try {
           const ingrediente = await Ingredientes.findById(req.params.id);
           if (!ingrediente) return res.status(404).json({ message: 'Ingrediente no encontrado' });
           await ingrediente.toggleActive();
           res.json(ingrediente);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   searchByNombre: async (req, res) => {
       try {
           const ingredientes = await Ingredientes.find(
               { $text: { $search: req.query.nombre } },
               { score: { $meta: "textScore" } }
           ).sort({ score: { $meta: "textScore" } });
           res.json(ingredientes);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   getByCategoria: async (req, res) => {
       try {
           const ingredientes = await Ingredientes.find({ 
               categoria: req.params.categoriaId,
               active: true 
           }).populate('categoria');
           res.json(ingredientes);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   updateStock: async (req, res) => {
       try {
           const ingrediente = await Ingredientes.findById(req.params.id);
           if (!ingrediente) return res.status(404).json({ message: 'Ingrediente no encontrado' });

           ingrediente.stockActual = req.body.stockActual;
           if (req.body.stockMinimo !== undefined) {
               ingrediente.stockMinimo = req.body.stockMinimo;
           }

           await ingrediente.save();
           res.json(ingrediente);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   }
};

module.exports = ingredientesController;