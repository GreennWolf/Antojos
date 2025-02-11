// controllers/productosController.js
const mongoose = require('mongoose');
const Productos = require('../database/models/ProductosModel');

const productosController = {
     create : async (req, res) => {
        try {
            
    
            // Verificar subCategoria
            const SubCategorias = mongoose.model('SubCategorias');
            
            
            const subCategoriaExists = await SubCategorias.findById(req.body.subCategoria);
            
            
            if (!subCategoriaExists) {
                
                return res.status(400).json({
                    message: 'La subcategoría especificada no existe'
                });
            }
    
            // Verificar ingredientes
            if (req.body.ingredientes?.length > 0) {
                const Ingredientes = mongoose.model('Ingredientes');
                for (const ing of req.body.ingredientes) {
                    
                    const ingredienteExists = await Ingredientes.findById(ing.ingrediente);
                    if (!ingredienteExists) {
                        
                        return res.status(400).json({
                            message: `El ingrediente ${ing.ingrediente} no existe`
                        });
                    }
                }
            }
    
            const producto = new Productos({
                ...req.body,
                createdBy: req.user?.id
            });
    
            await producto.save();
    
            
    
            const populatedProducto = await Productos.findById(producto._id)
                .populate('subCategoria')
                .populate('ingredientes.ingrediente')
                .populate('createdBy', 'nombre');
    
            
    
            res.status(201).json(populatedProducto);
        } catch (error) {
            console.error('Error creating producto:', error);
            res.status(400).json({ 
                message: error.message,
                details: error.stack
            });
        }
    },

   getAll: async (req, res) => {
       try {
           const productos = await Productos.find()
               .populate('subCategoria')
               .populate('ingredientes.ingrediente')
               .populate('productos.producto')
               .populate('createdBy', 'nombre');
           res.json(productos);
       } catch (error) {            
           res.status(500).json({ message: error.message });
       }
   },

   getById: async (req, res) => {
    try {
        const producto = await Productos.findById(req.params.id)
            .populate({
                path: 'subCategoria',
                populate: { path: 'categoria' } // Poblar la categoría asociada a la subcategoría
            })
            .populate({
                path: 'ingredientes.ingrediente', // Poblar los ingredientes de los productos
                select: 'nombre unidad' // Solo incluir campos específicos (si el modelo Ingredientes lo tiene)
            })
            .populate({
                path: 'productos.producto', // Poblar productos relacionados (productos compuestos)
                select: 'nombre precio' // Solo incluir campos necesarios
            })
            .populate('createdBy', 'nombre email'); // Poblar el usuario que creó el producto

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json(producto);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
},

   update: async (req, res) => {
       try {
           const producto = await Productos.findByIdAndUpdate(
               req.params.id,
               req.body,
               { new: true, runValidators: true }
           ).populate([
               {path: 'subCategoria'},
               {path: 'ingredientes.ingrediente'},
               {path: 'productos.producto'},
               {path: 'createdBy', select: 'nombre'}
           ]);

           if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
           res.json(producto);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   delete: async (req, res) => {
       try {
           const producto = await Productos.findByIdAndDelete(req.params.id);
           if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
           res.json({ message: 'Producto eliminado' });
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   toggleActive: async (req, res) => {
       try {
           const producto = await Productos.findById(req.params.id);
           if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
           await producto.toggleActive();
           res.json(producto);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   searchByNombre: async (req, res) => {
       try {
           const productos = await Productos.find(
               { $text: { $search: req.query.nombre } },
               { score: { $meta: "textScore" } }
           )
           .sort({ score: { $meta: "textScore" } })
           .populate('subCategoria');
           res.json(productos);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   getBySubCategoria: async (req, res) => {
       try {
           const productos = await Productos.find({ 
               subCategoria: req.params.subCategoriaId,
               active: true 
           }).populate('subCategoria');
           res.json(productos);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   updateStock: async (req, res) => {
       try {
           const producto = await Productos.findById(req.params.id);
           if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });

           producto.stockActual = req.body.stockActual;
           if (req.body.stockMinimo !== undefined) {
               producto.stockMinimo = req.body.stockMinimo;
           }

           await producto.save();
           res.json(producto);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   }
};

module.exports = productosController;