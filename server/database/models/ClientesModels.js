// models/ClientesModel.js
const mongoose = require('mongoose');

const ClientesSchema = new mongoose.Schema({
    // Datos de identificación fiscal
    nif: {
        type: String,
        required: true,
        unique: true,
        trim: true
        // NIF para personas físicas o CIF para empresas
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellidos: {
        type: String,
        trim: true
        // Opcional para empresas
    },
    nombreComercial: {
        type: String,
        trim: true
        // Nombre comercial o de la empresa
    },
    // Dirección fiscal
    direccion: {
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
        piso: {
            type: String,
            trim: true
        },
        puerta: {
            type: String,
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
        },
        pais: {
            type: String,
            default: 'España',
            trim: true
        }
    },
    // Contacto
    contacto: {
        telefono: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        }
    },
    // Datos adicionales para facturación
    regimen: {
        type: String,
        enum: ['general', 'recargo', 'intracomunitario', 'extracomunitario'],
        default: 'general'
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: true
});

// Índices
ClientesSchema.index({ email: 1 });
ClientesSchema.index({ 
    nombre: 'text', 
    apellidos: 'text', 
    nombreComercial: 'text' 
});

// Virtual para nombre completo
ClientesSchema.virtual('nombreCompleto').get(function() {
    if (this.nombreComercial) {
        return this.nombreComercial;
    }
    return this.apellidos ? `${this.nombre} ${this.apellidos}` : this.nombre;
});

// Virtual para dirección completa
ClientesSchema.virtual('direccionCompleta').get(function() {
    let direccion = `${this.direccion.calle}, ${this.direccion.numero}`;
    if (this.direccion.piso) direccion += `, ${this.direccion.piso}`;
    if (this.direccion.puerta) direccion += ` ${this.direccion.puerta}`;
    direccion += `\n${this.direccion.codigoPostal} ${this.direccion.localidad}`;
    direccion += `\n${this.direccion.provincia}, ${this.direccion.pais}`;
    return direccion;
});

// Método para validar NIF/CIF
ClientesSchema.methods.validarNIF = function() {
    // Aquí implementarías la validación específica de NIF/CIF
    // Podrías usar una librería como 'dni-js' o implementar tu propia validación
    return true;
};

// Configuración para incluir virtuals en JSON
ClientesSchema.set('toJSON', { virtuals: true });
ClientesSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Clientes', ClientesSchema);