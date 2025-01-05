// models/ProductosModel.js
const mongoose = require('mongoose');

const ProductosSchema = new mongoose.Schema({
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
    subCategoria: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategorias',
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
    productos: [{
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Productos',
        },
        cantidad: {
            type: Number,
            required: true,
            min: 1
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
ProductosSchema.index({ categoria: 1, subCategoria: 1, active: 1 });
ProductosSchema.index({ nombre: 'text', descripcion: 'text' });
ProductosSchema.methods.toggleActive = function() {
    this.active = !this.active;
    return this.save();
}

module.exports = mongoose.model('Productos', ProductosSchema);