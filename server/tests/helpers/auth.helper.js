// tests/helpers/auth.helper.js
const Usuarios = require('../../models/UsuariosModel');
const Roles = require('../../models/RolesModel');
const PRIVILEGES  = require('../../constants/privileges');

const createAdminRole = async () => {
    const allPrivileges = Object.values(PRIVILEGES)
        .flatMap(group => Object.values(group))
        .reduce((acc, privilege) => {
            acc[privilege] = true;
            return acc;
        }, {});

    const adminRole = new Roles({
        nombre: 'Super Admin Test',
        descripcion: 'Rol con todos los privilegios para testing',
        permisos: new Map(Object.entries(allPrivileges)),
        createdBy: 'system'
    });

    return await adminRole.save();
};

const createAdminUser = async (roleId) => {
    const adminUser = new Usuarios({
        nombre: 'Admin Test',
        codigo: '123456',
        rol: roleId,
        active: true,
        createdBy: 'system'
    });

    return await adminUser.save();
};