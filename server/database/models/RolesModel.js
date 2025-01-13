const mongoose = require('mongoose');

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
        type: Object,
        required: true,
        default: () => ({}) 
    },
    createdBy: {
        type: mongoose.Schema.Types.Mixed, // Mantener Mixed para permitir string u ObjectId
        ref: 'Usuarios',
        required: true,
        default: 'system'
    },
    isSystemCreated: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Middleware pre-save para manejar isSystemCreated
RolesSchema.pre('save', function(next) {
    if (this.createdBy === 'system') {
        this.isSystemCreated = true;
    }
    next();
});

// Actualizar los métodos existentes para trabajar con Object en lugar de Map
RolesSchema.methods.hasPermission = function(permission) {
    return Boolean(this.permisos[permission]);
};

RolesSchema.methods.hasMultiplePermission = function(permissions) {
    return permissions.every(permission => Boolean(this.permisos[permission]));
};

RolesSchema.methods.updatePermissions = function(permissions) {
    this.permisos = { ...this.permisos, ...permissions };
    return this.save();
};

RolesSchema.methods.toggleActive = function() {
    this.active = !this.active;
    return this.save();
};

module.exports = mongoose.model('Roles', RolesSchema);