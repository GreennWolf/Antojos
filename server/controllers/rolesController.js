// controllers/rolesController.js
const Roles = require('../database/models/RolesModel');

const rolesController = {
   create: async (req, res) => {
       try {
           const rol = new Roles({
               ...req.body,
               createdBy: req.user.id
           });
           await rol.save();
           res.status(201).json(rol);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   getAll: async (req, res) => {
       try {
           const roles = await Roles.find().populate('createdBy', 'nombre');
           res.json(roles);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   getById: async (req, res) => {
       try {
           const rol = await Roles.findById(req.params.id).populate('createdBy', 'nombre');
           if (!rol) return res.status(404).json({ message: 'Rol no encontrado' });
           res.json(rol);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   update: async (req, res) => {
       try {
           const rol = await Roles.findById(req.params.id);
           if (!rol) return res.status(404).json({ message: 'Rol no encontrado' });
           
           if (req.body.nombre) rol.nombre = req.body.nombre;
           if (req.body.descripcion) rol.descripcion = req.body.descripcion;
           
           await rol.save();
           res.json(rol);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   delete: async (req, res) => {
       try {
           const rol = await Roles.findByIdAndDelete(req.params.id);
           if (!rol) return res.status(404).json({ message: 'Rol no encontrado' });
           res.json({ message: 'Rol eliminado' });
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   updatePermissions: async (req, res) => {
       try {
           const rol = await Roles.findById(req.params.id);
           if (!rol) return res.status(404).json({ message: 'Rol no encontrado' });
           
           await rol.updatePermissions(req.body.permisos);
           res.json(rol);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   toggleActive: async (req, res) => {
       try {
           const rol = await Roles.findById(req.params.id);
           if (!rol) return res.status(404).json({ message: 'Rol no encontrado' });
           
           await rol.toggleActive();
           res.json(rol);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   }
};

module.exports = rolesController;