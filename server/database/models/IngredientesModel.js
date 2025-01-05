// models/IngredientesModel.js
const mongoose = require('mongoose');

const IngredientesSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    precio: {
        type: Number,
        required: true,
        min: 0
    },
    costo: {
        type: Number,
        required: true,
        min: 0
    },
    stockActual: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    stockMinimo: {
        type: Number,
        default: 0,
        min: 0
    },
    categoria: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categoria',
        required: true,
        index: true
    },
    ingredientes: [{
        ingrediente: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ingredientes',
        },
        cantidad: {
            type: Number,
            required: true,
            min: 0
        },
        unidad: {
            type: String,
            required: true,
            enum: ['g', 'kg', 'ml', 'l', 'unidad']
        }
    }],
    imagen: {
        type: String,
        required: false
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuarios',
        required: true
    },
}, {
    timestamps: true
});

// Índices
IngredientesSchema.index({ categoria: 1, subCategoria: 1, active: 1 });
IngredientesSchema.index({ nombre: 'text', descripcion: 'text' });
IngredientesSchema.methods.toggleActive = function() {
    this.active = !this.active;
    return this.save();
}

module.exports = mongoose.model('Ingredientes', IngredientesSchema);