// controllers/categoriasController.js
const Categorias = require('../database/models/CategoriasModel');

const categoriaController = {
    create: async (req, res) => {
        try {
            // Verificar si ya existe una categoría con el mismo nombre
            const existingCategoria = await Categorias.findOne({ 
                nombre: req.body.nombre 
            });
            
            if (existingCategoria) {
                return res.status(400).json({ 
                    message: 'Ya existe una categoría con este nombre' 
                });
            }
    
            const categoria = new Categorias({
                ...req.body,
                createdBy: req.user.id
            });
            await categoria.save();
            res.status(201).json(categoria);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

   getAll: async (req, res) => {
       try {
           const categorias = await Categorias.find();
           res.json(categorias);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   getById: async (req, res) => {
       try {
           const categoria = await Categorias.findById(req.params.id);
           if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada' });
           res.json(categoria);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   update: async (req, res) => {
       try {
           const categoria = await Categorias.findByIdAndUpdate(
               req.params.id, 
               req.body,
               { new: true }
           );
           if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada' });
           res.json(categoria);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   delete: async (req, res) => {
       try {
           const categoria = await Categorias.findByIdAndDelete(req.params.id);
           if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada' });
           res.json({ message: 'Categoría eliminada' });
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   toggleActive: async (req, res) => {
       try {
           const categoria = await Categorias.findById(req.params.id);
           if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada' });
           await categoria.toggleActive();
           res.json(categoria);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   }
};

module.exports = categoriaController;