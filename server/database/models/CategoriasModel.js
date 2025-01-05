// models/CategoriasModel.js
const mongoose = require('mongoose');

const CategoriasSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true,
    },
    ingrediente:{
        type:Boolean,
        requiered:true,
        default:false,
    },
    active:{
        type:Boolean,
        required:true,
        default:true,
    },
}, {
    timestamps: true
});

CategoriasSchema.methods.toggleActive = function() {
    this.active = !this.active;
    return this.save();
}

module.exports = mongoose.model('Categorias', CategoriasSchema);