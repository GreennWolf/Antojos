// controllers/usuariosController.js
const Usuarios = require('../database/models/UsuariosModel');
const bcrypt = require('bcryptjs');

const usuariosController = {
   create: async (req, res) => {
       try {
           const usuario = new Usuarios({
               ...req.body,
               createdBy: req.user.id
           });

           // Hash del código si es necesario
           if (req.body.codigo) {
               const salt = await bcrypt.genSalt(10);
               usuario.codigo = await bcrypt.hash(req.body.codigo, salt);
           }

           await usuario.save();
           
           const populatedUsuario = await usuario.populate([
               { path: 'rol' },
               { path: 'createdBy', select: 'nombre' }
           ]);

           res.status(201).json(populatedUsuario);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   getAll: async (req, res) => {
       try {
           const usuarios = await Usuarios.find()
               .populate('rol')
               .populate('createdBy', 'nombre');
           res.json(usuarios);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   getById: async (req, res) => {
       try {
           const usuario = await Usuarios.findById(req.params.id)
               .populate('rol')
               .populate('createdBy', 'nombre');
           if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
           res.json(usuario);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   update: async (req, res) => {
       try {
           // Si se está actualizando el código, hashearlo
           if (req.body.codigo) {
               const salt = await bcrypt.genSalt(10);
               req.body.codigo = await bcrypt.hash(req.body.codigo, salt);
           }

           const usuario = await Usuarios.findByIdAndUpdate(
               req.params.id,
               req.body,
               { new: true }
           ).populate('rol')
            .populate('createdBy', 'nombre');

           if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
           res.json(usuario);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   delete: async (req, res) => {
       try {
           const usuario = await Usuarios.findByIdAndDelete(req.params.id);
           if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
           res.json({ message: 'Usuario eliminado' });
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   toggleActive: async (req, res) => {
       try {
           const usuario = await Usuarios.findById(req.params.id);
           if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
           await usuario.toggleActive();
           res.json(usuario);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   login: async (req, res) => {
       try {
           const { codigo } = req.body;
           const usuario = await Usuarios.findOne({ active: true }).populate('rol');
           
           if (!usuario) {
               return res.status(401).json({ message: 'Usuario no encontrado o inactivo' });
           }

           const isMatch = await bcrypt.compare(codigo, usuario.codigo);
           if (!isMatch) {
               return res.status(401).json({ message: 'Código incorrecto' });
           }

           res.json({
               usuario,
               permisos: usuario.rol.permisos
           });
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   }
};

module.exports = usuariosController;

