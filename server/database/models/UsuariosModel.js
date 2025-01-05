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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuarios',
        required: true
    }
}, {
    timestamps: true
});

UsuariosSchema.methods.toggleActive = function() {
    this.active = !this.active;
    return this.save();
}

module.exports = mongoose.model('Usuarios', UsuariosSchema);