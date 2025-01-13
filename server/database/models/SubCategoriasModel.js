// models/SubCategoriasModel.js
const mongoose = require('mongoose');

const SubCategoriasSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true,
        trim: true // Buena práctica: eliminar espacios en blanco
    },
    categoria: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categorias',
        required: true,
        index: true // Mejora el rendimiento en búsquedas
    },
    iva: {
        type: Number,
        required: true,
        default: 10,
        min: 0,
        max: 100 // Validación para asegurar un porcentaje válido
    },
    ingredientesPermitidos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredientes'
    }],
    active: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: true
});

// Índice compuesto para búsquedas comunes
SubCategoriasSchema.index({ categoria: 1, active: 1 });

// Método para toggle active
SubCategoriasSchema.methods.toggleActive = function() {
    this.active = !this.active;
    return this.save();
};

// Método para agregar ingredientes
SubCategoriasSchema.methods.addIngrediente = function(ingredienteId) {
    if (!this.ingredientesPermitidos.includes(ingredienteId)) {
        this.ingredientesPermitidos.push(ingredienteId);
    }
    return this.save();
};

// Método para remover ingredientes
SubCategoriasSchema.methods.removeIngrediente = function(ingredienteId) {
    this.ingredientesPermitidos = this.ingredientesPermitidos.filter(
        id => !id.equals(ingredienteId)
    );
    return this.save();
};

module.exports = mongoose.model('SubCategorias', SubCategoriasSchema);