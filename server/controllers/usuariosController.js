const Usuarios = require('../database/models/UsuariosModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Definimos la clave secreta para JWT (mejor en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta';

const usuariosController = {
    // Crear un nuevo usuario
    create: async (req, res) => {
        try {
            // Verificar si ya existe un usuario con el mismo código
            const existingUser = await Usuarios.findOne({ 
                codigo: req.body.codigo,
                active: true 
            });
            
            if (existingUser) {
                return res.status(400).json({ 
                    message: 'Ya existe un usuario activo con este código' 
                });
            }

            const usuario = new Usuarios({
                ...req.body,
                createdBy: req.user?.id || 'system'
            });

            console.log(req.body.codigo)

            if (req.body.codigo) {
                const salt = await bcrypt.genSalt(10);
                usuario.codigo = await bcrypt.hash(req.body.codigo, salt);
            }
            
            await usuario.save();
            
            // Populate condicional
            let populatedUsuario;
            if (usuario.isSystemCreated) {
                populatedUsuario = await usuario.populate('rol');
            } else {
                populatedUsuario = await usuario.populate(['rol', { path: 'createdBy', select: 'nombre' }]);
            }

            res.status(201).json(populatedUsuario);
        } catch (error) {
            console.log(error.message);
            res.status(400).json({ message: error.message });
        }
    },

    // Obtener todos los usuarios
    getAll: async (req, res) => {
        try {
            const usuarios = await Usuarios.find().select('-codigo');
            
            // Populate solo los usuarios que no fueron creados por el sistema
            const populatedUsuarios = await Promise.all(usuarios.map(async (usuario) => {
                if (usuario.isSystemCreated) {
                    return await usuario.populate('rol');
                }
                return await usuario.populate(['rol', { path: 'createdBy', select: 'nombre' }]);
            }));
            
            res.json(populatedUsuarios);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Obtener un usuario por ID
    getById: async (req, res) => {
        try {
            const usuario = await Usuarios.findById(req.params.id).select('-codigo');
            
            if (!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            
            // Populate condicional
            let populatedUsuario;
            if (usuario.isSystemCreated) {
                populatedUsuario = await usuario.populate('rol');
            } else {
                populatedUsuario = await usuario.populate(['rol', { path: 'createdBy', select: 'nombre' }]);
            }
            
            res.json(populatedUsuario);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Actualizar un usuario
    update: async (req, res) => {
        try {
            const usuario = await Usuarios.findById(req.params.id);
    
            if (!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
    

            // Si se envía un código y no está vacío, procesarlo
            if (req.body.codigo && req.body.codigo.trim() !== '') {
                const existingUser = await Usuarios.findOne({ 
                    codigo: req.body.codigo,
                    _id: { $ne: req.params.id },
                    active: true 
                });
    
                if (existingUser) {
                    return res.status(400).json({ 
                        message: 'Ya existe un usuario activo con este código' 
                    });
                }
                const salt = await bcrypt.genSalt(10);
                req.body.codigo = await bcrypt.hash(req.body.codigo, salt);
                console.log(req.body.codigo)
            } else {
                // Si no se envía código o está vacío, eliminarlo del req.body para mantener el anterior
                delete req.body.codigo;
            }
    
            // Actualizar campos
            Object.keys(req.body).forEach(key => {
                usuario[key] = req.body[key];
            });
    
            await usuario.save();
    
            // Populate condicional
            let populatedUsuario;
            if (usuario.isSystemCreated) {
                populatedUsuario = await usuario.populate('rol');
            } else {
                populatedUsuario = await usuario.populate(['rol', { path: 'createdBy', select: 'nombre' }]);
            }
    
            const responseUsuario = populatedUsuario.toJSON();
            delete responseUsuario.codigo;
            
            res.json(responseUsuario);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Eliminar un usuario
    delete: async (req, res) => {
        try {
            const usuario = await Usuarios.findByIdAndDelete(req.params.id);
            
            if (!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            
            res.json({ message: 'Usuario eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Activar/Desactivar usuario
    toggleActive: async (req, res) => {
        try {
            const usuario = await Usuarios.findById(req.params.id);
            
            if (!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            usuario.active = !usuario.active;
            await usuario.save();

            // Populate condicional
            let populatedUsuario;
            if (usuario.isSystemCreated) {
                populatedUsuario = await usuario.populate('rol');
            } else {
                populatedUsuario = await usuario.populate(['rol', { path: 'createdBy', select: 'nombre' }]);
            }

            res.json(populatedUsuario);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Login de usuario
    login: async (req, res) => {
        try {
            const { codigo } = req.body;
    
            // Validar si el código se envió
            if (!codigo) {
                return res.status(400).json({ message: 'El código es requerido' });
            }
    
            // Obtener todos los usuarios activos
            const usuarios = await Usuarios.find({ active: true }).select('+codigo').populate('rol');
    
            // Buscar el usuario cuyo código haga match
            let usuarioEncontrado = null;
            for (const usuario of usuarios) {
                const isMatch = await bcrypt.compare(codigo, usuario.codigo);
                if (isMatch) {
                    usuarioEncontrado = usuario;
                    break;
                }
            }
    
            // Si no se encuentra un usuario con el código
            if (!usuarioEncontrado) {
                return res.status(401).json({ message: 'Código incorrecto o usuario no encontrado' });
            }
    
            // Generar token JWT
            const token = jwt.sign(
                {
                    id: usuarioEncontrado._id,
                    rol: usuarioEncontrado.rol._id,
                    permisos: usuarioEncontrado.rol.permisos,
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
    
            // Preparar respuesta
            const userResponse = usuarioEncontrado.toJSON();
            delete userResponse.codigo; // Eliminar 'codigo' antes de enviar al cliente
    
            res.json({
                usuario: userResponse,
                permisos: usuarioEncontrado.rol.permisos,
                token,
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Verificar token
    verifyToken: async (req, res) => {
        try {
            const usuario = await Usuarios.findById(req.user.id).select('-codigo');

            if (!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Populate condicional
            let populatedUsuario;
            if (usuario.isSystemCreated) {
                populatedUsuario = await usuario.populate('rol');
            } else {
                populatedUsuario = await usuario.populate(['rol', { path: 'createdBy', select: 'nombre' }]);
            }

            res.json({
                usuario: populatedUsuario,
                permisos: usuario.rol.permisos
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Cambiar código de usuario
    changePassword: async (req, res) => {
        try {
            const { codigoActual, codigoNuevo } = req.body;
            const usuario = await Usuarios.findById(req.user.id).select('+codigo');

            if (!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            const isMatch = await bcrypt.compare(codigoActual, usuario.codigo);
            if (!isMatch) {
                return res.status(401).json({ message: 'Código actual incorrecto' });
            }

            const salt = await bcrypt.genSalt(10);
            usuario.codigo = await bcrypt.hash(codigoNuevo, salt);
            await usuario.save();

            res.json({ message: 'Código actualizado correctamente' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = usuariosController;