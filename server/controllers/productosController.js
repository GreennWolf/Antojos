// controllers/productosController.js
const Productos = require('../database/models/ProductosModel');

const productosController = {
   create: async (req, res) => {
       try {
           const producto = new Productos({
               ...req.body,
               createdBy: req.user.id
           });
           await producto.save();
           res.status(201).json(await producto.populate([
               {path: 'subCategoria'},
               {path: 'ingredientes.ingrediente'},
               {path: 'productos.producto'},
               {path: 'createdBy', select: 'nombre'}
           ]));
       } catch (error) {
           res.status(400).json({ message: error.message });
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
               .populate('subCategoria')
               .populate('ingredientes.ingrediente')
               .populate('productos.producto')
               .populate('createdBy', 'nombre');
           if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
           res.json(producto);
       } catch (error) {
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