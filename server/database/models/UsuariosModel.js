// models/UsuariosModel.js
const mongoose = require('mongoose');

const UsuariosSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true,
    },
   codigo: {
        type: String,
        required: true,
        unique: true,
    },
    rol: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Roles',
        required: true
    },
    active:{
        type:Boolean,
        required:true,
        default:true,
    },
    createdBy: {
        type: mongoose.Schema.Types.Mixed, // Permite ObjectId o String
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

UsuariosSchema.virtual('codigoOriginal').get(function() {
    return this._codigoOriginal;
});

UsuariosSchema.virtual('codigoOriginal').set(function(value) {
    this._codigoOriginal = value;
});

UsuariosSchema.pre('save', function(next) {
    if (this.createdBy === 'system') {
        this.isSystemCreated = true;
    }
    next();
});


UsuariosSchema.methods.toggleActive = function() {
    this.active = !this.active;
    return this.save();
}

UsuariosSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.codigo; // No enviar el código hasheado
    return obj;
};

module.exports = mongoose.model('Usuarios', UsuariosSchema);