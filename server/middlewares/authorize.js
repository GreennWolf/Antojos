// middlewares/authorize.js
const { PRIVILEGES } = require('../constants/privileges.js');

const authorize = (...requiredPermissions) => {
    return async (req, res, next) => {
        try {
            const userRole = await Role.findById(req.user.roleId);
            
            const hasPermissions = requiredPermissions.every(permission => 
                userRole.permisos.get(permission) === true
            );

            if (!hasPermissions) {
                return res.status(403).json({ 
                    message: 'No tienes permisos suficientes' 
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = authorize;
