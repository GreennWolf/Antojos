// models/TicketsModel.js
const mongoose = require('mongoose');

const TicketsSchema = new mongoose.Schema({
    // Datos de numeración fiscal
    numeroTicket: {
        type: String,
        required: true,
        unique: true
    },
    serie: {
        type: String,
        required: true,
        default: 'B'
    },
    numeroSecuencial: {
        type: Number,
        required: true
    },
    ejercicioFiscal: {
        type: Number,
        required: true,
        default: () => new Date().getFullYear()
    },
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
        ref: 'MetodoDePago',
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
        horaCreacion: {
            type: Date,
            default: Date.now
        }
    }],
    productosEliminados: [{
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
        horaCreacion: {
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
    cliente:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required:false,
    },
    estado: {
        type: String,
        enum: ['valido', 'anulado'],
        default: 'valido',
        required: true
    },
    motivoAnulacion: {
        type: String,
        required: function() {
            return this.estado === 'anulado';
        }
    },
    fechaApertura: {
        type: Date,
        default: Date.now,
        required: true
    },
    fechaCierre: {
        type: Date,
        default: Date.now,
        required: true
    }
}, {
    timestamps: true
});

// Índices
TicketsSchema.index({ serie: 1, numeroSecuencial: 1, ejercicioFiscal: 1 }, { unique: true });
TicketsSchema.index({ mesa: 1, fechaApertura: -1 });

// Método estático para generar número de ticket
TicketsSchema.statics.generarNumeroTicket = async function(serie = 'B') {
    const ejercicio = new Date().getFullYear();
    
    // Buscar el último número para esta serie y ejercicio
    const ultimoTicket = await this.findOne({
        serie: serie,
        ejercicioFiscal: ejercicio
    }).sort({ numeroSecuencial: -1 });

    const numeroSecuencial = ultimoTicket ? ultimoTicket.numeroSecuencial + 1 : 1;

    // Formato: SERIE/AÑO/NÚMERO (ej: A/2024/000001)
    const numeroTicket = `${serie}/${ejercicio}/${numeroSecuencial.toString().padStart(6, '0')}`;

    return {
        numeroTicket,
        serie,
        numeroSecuencial,
        ejercicioFiscal: ejercicio
    };
};

// Método para calcular el total
TicketsSchema.methods.calcularTotal = function() {
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

// Pre-save middleware para generar número de ticket si no existe
TicketsSchema.pre('save', async function(next) {
    if (!this.numeroTicket) {
        try {
            const numeracion = await this.constructor.generarNumeroTicket(this.serie);
            this.numeroTicket = numeracion.numeroTicket;
            this.numeroSecuencial = numeracion.numeroSecuencial;
            this.ejercicioFiscal = numeracion.ejercicioFiscal;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Pre-save middleware para calcular totales antes de guardar
TicketsSchema.pre('save', function(next) {
    if (this.isModified('productos') || this.isModified('descuento')) {
        this.calcularTotal();
    }
    next();
});

module.exports = mongoose.model('Tickets', TicketsSchema);