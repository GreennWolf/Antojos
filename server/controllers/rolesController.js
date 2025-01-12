const Roles = require('../database/models/RolesModel');

const rolesController = {
    create: async (req, res) => {
        try {
            // Validar que todos los campos requeridos estén presentes
            if (!req.body.nombre) {
                return res.status(400).json({
                    message: 'El nombre del rol es requerido'
                });
            }
    
            // Verificar si ya existe un rol con el mismo nombre
            const existingRole = await Roles.findOne({ 
                nombre: { $regex: new RegExp(`^${req.body.nombre}$`, 'i') } // Búsqueda case-insensitive
            });
            
            console.log(existingRole , 'xd')

            if (existingRole) {
                return res.status(400).json({ 
                    message: `Ya existe un rol con el nombre "${req.body.nombre}"`,
                    existingRole: {
                        id: existingRole._id,
                        nombre: existingRole.nombre,
                        active: existingRole.active
                    }
                });
            }
    
            if (req.body.permisos && typeof req.body.permisos !== 'object') {
                return res.status(400).json({ 
                    message: 'El formato de los permisos no es válido' 
                });
            }
    
            // Crear nuevo rol
            const rol = new Roles({
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                active: req.body.active !== undefined ? req.body.active : true,
                permisos: req.body.permisos || {},
                createdBy: req.user?.id || 'system'
            });
    
            await rol.save();
    
            // Populate condicional
            let populatedRol;
            if (rol.isSystemCreated) {
                populatedRol = rol;
            } else {
                populatedRol = await rol.populate('createdBy', 'nombre');
            }
            
            res.status(201).json(populatedRol);
        } catch (error) {
            console.error('Error creating role:', error);
            res.status(400).json({ 
                message: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    },

   getAll: async (req, res) => {
       try {
           const roles = await Roles.find();
           
           // Populate solo los roles que no fueron creados por el sistema
           const populatedRoles = await Promise.all(roles.map(async (rol) => {
               if (!rol.isSystemCreated) {
                   return await rol.populate('createdBy', 'nombre');
               }
               return rol;
           }));

           res.json(populatedRoles);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   getById: async (req, res) => {
       try {
           const rol = await Roles.findById(req.params.id);
           if (!rol) return res.status(404).json({ message: 'Rol no encontrado' });

           // Populate condicional
           let populatedRol;
           if (rol.isSystemCreated) {
               populatedRol = rol;
           } else {
               populatedRol = await rol.populate('createdBy', 'nombre');
           }

           res.json(populatedRol);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   update: async (req, res) => {
       try {
           const rol = await Roles.findById(req.params.id);
           if (!rol) return res.status(404).json({ message: 'Rol no encontrado' });
           
           // Verificar nombre único si se está cambiando

           if (req.body.nombre && req.body.nombre !== rol.nombre) {
               const existingRole = await Roles.findOne({ nombre: req.body.nombre });
               if (existingRole) {
                   return res.status(400).json({ 
                       message: 'Ya existe un rol con este nombre' 
                   });
               }
           }

           // Actualizar campos permitidos
           const fieldsToUpdate = ['nombre', 'descripcion', 'active'];
           fieldsToUpdate.forEach(field => {
               if (req.body[field] !== undefined) {
                   rol[field] = req.body[field];
               }
           });

           await rol.save();

           // Populate condicional
           let populatedRol;
           if (rol.isSystemCreated) {
               populatedRol = rol;
           } else {
               populatedRol = await rol.populate('createdBy', 'nombre');
           }

           res.json(populatedRol);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   delete: async (req, res) => {
       try {
           // Verificar que no sea el último rol activo
           const activeRoles = await Roles.countDocuments({ active: true });
           const rolToDelete = await Roles.findById(req.params.id);

           if (!rolToDelete) {
               return res.status(404).json({ message: 'Rol no encontrado' });
           }

           if (activeRoles <= 1 && rolToDelete.active) {
               return res.status(400).json({ 
                   message: 'No se puede eliminar el último rol activo' 
               });
           }

           await Roles.findByIdAndDelete(req.params.id);
           res.json({ message: 'Rol eliminado exitosamente' });
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },

   updatePermissions: async (req, res) => {
       try {
           const rol = await Roles.findById(req.params.id);
           if (!rol) return res.status(404).json({ message: 'Rol no encontrado' });
           
           // Validar estructura de permisos
           if (typeof req.body.permisos !== 'object') {
               return res.status(400).json({ 
                   message: 'El formato de los permisos no es válido' 
               });
           }

           // Actualizar permisos
           rol.permisos = req.body.permisos;
           await rol.save();

           // Populate condicional
           let populatedRol;
           if (rol.isSystemCreated) {
               populatedRol = rol;
           } else {
               populatedRol = await rol.populate('createdBy', 'nombre');
           }

           res.json(populatedRol);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   toggleActive: async (req, res) => {
       try {
           const rol = await Roles.findById(req.params.id);
           if (!rol) return res.status(404).json({ message: 'Rol no encontrado' });

           // Verificar que no sea el último rol activo si se está desactivando
           if (rol.active) {
               const activeRoles = await Roles.countDocuments({ active: true });
               if (activeRoles <= 1) {
                   return res.status(400).json({ 
                       message: 'No se puede desactivar el último rol activo' 
                   });
               }
           }
           
           rol.active = !rol.active;
           await rol.save();

           // Populate condicional
           let populatedRol;
           if (rol.isSystemCreated) {
               populatedRol = rol;
           } else {
               populatedRol = await rol.populate('createdBy', 'nombre');
           }

           res.json(populatedRol);
       } catch (error) {
           res.status(400).json({ message: error.message });
       }
   },

   getPrivileges: async (req, res) => {
       try {
           const PRIVILEGES = require('../constants/privileges');
           res.json(PRIVILEGES);
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   },
};

module.exports = rolesController;