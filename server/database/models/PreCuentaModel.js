// models/PreCuentaModel.js
const mongoose = require('mongoose');

const PreCuentaSchema = new mongoose.Schema({
    mesa: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mesas',
        required: true,
        index: true
    },
    camarero: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuarios',
        required: true
    },
    metodoDePago:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MetodosDePago',
        required: true
    },
    productos: [{
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Productos',
            required: true
        },
        ingredientes: {
            excluidos: [{
                ingrediente: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Ingredientes'
                },
            }],
            extras: [{
                ingrediente: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Ingredientes'
                },
                costoExtra: {
                    type: Number,
                    default: 0
                },
                cantidad: {
                    type: Number,
                    default: 1,
                    min: 1
                },
            }]
        },
        cantidad: {
            type: Number,
            required: true,
            min: 1
        },
        precio: {
            type: Number,
            required: true
        },
        observaciones: String,
        horaEnvio: {
            type: Date,
            default: Date.now
        }
    }],
    productosEliminados: [{
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Productos',
        },
        ingredientes: {
            excluidos: [{
                ingrediente: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Ingredientes'
                },
            }],
            extras: [{
                ingrediente: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Ingredientes'
                },
                costoExtra: {
                    type: Number,
                    default: 0
                },
                cantidad: {
                    type: Number,
                    default: 1,
                    min: 1
                },
            }]
        },
        cantidad: {
            type: Number,
            min: 1
        },
        precio: {
            type: Number,
        },
        observaciones: String,
        horaEliminacion: {
            type: Date,
            default: Date.now
        }
    }],
    descuento: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    subTotal: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        default: 0
    },
    fechaApertura: {
        type: Date,
        default: Date.now,
        required: true
    }
}, {
    timestamps: true
});

// Método para calcular el total
PreCuentaSchema.methods.calcularTotal = function() {
    // Calcular subtotal
    this.subTotal = this.productos.reduce((sum, item) => {
        let precioItem = item.precio * item.cantidad;
        
        // Sumar costos extras de ingredientes
        if (item.ingredientes && item.ingredientes.extras) {
            precioItem += item.ingredientes.extras.reduce(
                (extraSum, extra) => extraSum + (extra.costoExtra * extra.cantidad), 0
            );
        }
        
        return sum + precioItem;
    }, 0);
    
    // Aplicar descuento
    this.total = this.subTotal * (1 - this.descuento / 100);
    
    return this.total;
};

module.exports = mongoose.model('PreCuenta', PreCuentaSchema);