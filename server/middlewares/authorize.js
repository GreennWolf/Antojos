const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta';

const authorize = (requiredPermission , print=false) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if(print){
                console.log('authHeader:', authHeader)
            }
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ 
                    message: 'No autorizado - Token no proporcionado' 
                });
            }

            const token = authHeader.split(' ')[1];

            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                
                // Si requiere un permiso específico, verificarlo
                if (requiredPermission) {
                    const [section, action] = requiredPermission.split('.');
                    if(print){
                        console.log(requiredPermission);
                    }
                    
                    
                    // Verificar si existe la sección y el permiso específico
                    const hasPermission = decoded.permisos && 
                                        decoded.permisos[section] && 
                                        decoded.permisos[section][action];

                    if (!hasPermission) {
                        return res.status(403).json({ 
                            message: 'Acceso denegado - Permiso insuficiente',
                            requiredPermission: `${section}.${action}`,
                            availablePermissions: decoded.permisos[section] || {}
                        });
                    }
                }

                // Agregar la información del usuario decodificada a la request
                req.user = {
                    id: decoded.id,
                    rol: decoded.rol,
                    permisos: decoded.permisos
                };

                next();
            } catch (error) {
                console.error('Error verificando token:', error);
                return res.status(401).json({ 
                    message: 'Token inválido o expirado'
                });
            }
        } catch (error) {
            console.error('Error en middleware de autorización:', error);
            res.status(500).json({ 
                message: 'Error en la autorización',
                error: error.message 
            });
        }
    };
};

module.exports = authorize;