// models/RolesModel.js
const mongoose = require('mongoose');

const { PRIVILEGES } = require('../../constants/privileges');

const RolesSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: false,
        trim: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    permisos: {
        type: Map,
        of: Boolean,
        default: () => {
            // Crear un mapa con todos los privilegios en false
            const allPrivileges = Object.values(PRIVILEGES)
                .flatMap(group => Object.values(group));
            return new Map(allPrivileges.map(priv => [priv, false]));
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuarios',
        required: true
    }
}, {
    timestamps: true
});

// Método para verificar si tiene un permiso específico
RolesSchema.methods.hasPermission = function(permission) {
    return this.permisos.get(permission) === true;
};

RolesSchema.methods.hasMultiplePermission = function(permissions) {
    return permissions.every(permission => this.permisos.get(permission) === true);
};

// Método para actualizar múltiples permisos
RolesSchema.methods.updatePermissions = function(permissions) {
    for (const [permission, value] of Object.entries(permissions)) {
        if (this.permisos.has(permission)) {
            this.permisos.set(permission, value);
        }
    }
    return this.save();
};

// Método para activar/desactivar el rol
RolesSchema.methods.toggleActive = function() {
    this.active = !this.active;
    return this.save();
};

module.exports = mongoose.model('Roles', RolesSchema);