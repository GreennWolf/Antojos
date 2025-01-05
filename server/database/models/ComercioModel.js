// models/ComercioModel.js
const mongoose = require('mongoose');

const ComercioSchema = new mongoose.Schema({
    nombre:{
        type:String,
        required:true,
    },
    logo:{
        type:String,
        required:false,
    },
    // Datos obligatorios para facturación
    razonSocial: {
        type: String,
        required: true,
        trim: true
    },
    nif: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    direccionFiscal: {
        calle: {
            type: String,
            required: true,
            trim: true
        },
        numero: {
            type: String,
            required: true,
            trim: true
        },
        codigoPostal: {
            type: String,
            required: true,
            trim: true
        },
        localidad: {
            type: String,
            required: true,
            trim: true
        },
        provincia: {
            type: String,
            required: true,
            trim: true
        }
    },
    telefono: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: true
});

// Virtual para dirección completa formateada
ComercioSchema.virtual('direccionCompleta').get(function() {
    return `${this.direccionFiscal.calle}, ${this.direccionFiscal.numero}, ${this.direccionFiscal.codigoPostal} ${this.direccionFiscal.localidad}, ${this.direccionFiscal.provincia}`;
});

module.exports = mongoose.model('Comercio', ComercioSchema);