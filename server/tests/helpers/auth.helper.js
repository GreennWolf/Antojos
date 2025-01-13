const mongoose = require('mongoose');
const PRIVILEGES = require('../../constants/privileges');
const bcrypt = require('bcryptjs');

const createAdminRole = async () => {
    const Roles = mongoose.model('Roles');
    const allPrivileges = Object.values(PRIVILEGES)
        .flatMap(group => Object.values(group))
        .reduce((acc, privilege) => ({
            ...acc,
            [privilege]: true
        }), {});

    const role = await Roles.create({
        nombre: 'Owner',
        descripcion: 'Rol con privilegios completos',
        permisos: allPrivileges, // Pasar como objeto normal
        createdBy: 'system' // Ahora aceptará 'system' por los cambios en el modelo
    });
    if (!role) {
        throw new Error('Error al crear el rol admin');
    }

    return role;
};

const createAdminUser = async (roleId) => {
    const salt = await bcrypt.genSalt(10);
    const codigo = await bcrypt.hash('123456', salt);

    const Usuarios = mongoose.model('Usuarios');
    const user = await Usuarios.create({
        nombre: 'Admin Test',
        codigo: codigo,
        rol: roleId,
        createdBy: 'system'
    });

    if (!user) {
        throw new Error('Error al crear el usuario admin');
    }

    return user;
};

const verifyData = async () => {
    const Roles = mongoose.model('Roles');
    const Usuarios = mongoose.model('Usuarios');

    const roles = await Roles.find({});
    console.log(roles, 'Roles existentes en la base de datos');

    const users = await Usuarios.find({});
    console.log(users, 'Usuarios existentes en la base de datos');
};

module.exports = { createAdminRole, createAdminUser, verifyData };

