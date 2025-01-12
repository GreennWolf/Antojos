// controllers/preCuentaController.js
const PreCuenta = require('../database/models/PreCuentaModel');
const Tickets = require('../database/models/Tickets');
const TicketsTemps = require('../database/models/TicketsTemps');

const PRECUENTA_POPULATE_PATHS = [
    { path: 'mesa' },
    { path: 'camarero' },
    { path: 'metodoDePago' },
    { path: 'productos.producto' },
    { path: 'productos.ingredientes.excluidos.ingrediente' },
    { path: 'productos.ingredientes.extras.ingrediente' }
];


const TICKET_POPULATE_PATHS = [
    { path: 'mesa' },
    { path: 'camarero' },
    { path: 'productos.producto' },
    { path: 'productos.ingredientes.excluidos.ingrediente' },
    { path: 'productos.ingredientes.extras.ingrediente' },
];

const preCuentaController = {
    // Obtener todas las precuentas
    getAllPreCuentas: async (req, res) => {
        try {
            const preCuentas = await PreCuenta.find()
                .populate(PRECUENTA_POPULATE_PATHS);
            res.json(preCuentas);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Modificar método de pago
    changeMetodoPago: async (req, res) => {
        try {
            const { preCuentaId, metodoPagoId } = req.body;

            const preCuenta = await PreCuenta.findById(preCuentaId);
            if (!preCuenta) {
                return res.status(404).json({ message: 'PreCuenta no encontrada' });
            }

            preCuenta.metodoDePago = metodoPagoId;
            await preCuenta.save();

            const preCuentaPopulada = await preCuenta.populate(PRECUENTA_POPULATE_PATHS);
            res.json(preCuentaPopulada);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Reabrir mesa (eliminar precuenta)
    reOpen: async (req, res) => {
        try {
            const { preCuentaId } = req.body;

            // Buscar la precuenta
            const preCuenta = await PreCuenta.findById(preCuentaId);
            if (!preCuenta) {
                return res.status(404).json({ message: 'PreCuenta no encontrada' });
            }

            // Crear nuevo ticket temporal
            const ticketTemp = new TicketsTemps({
                mesa: preCuenta.mesa,
                camarero: preCuenta.camarero,
                productos: preCuenta.productos,
                productosEliminados: preCuenta.productosEliminados,
                descuento: preCuenta.descuento,
                subTotal: preCuenta.subTotal,
                total: preCuenta.total
            });

            await ticketTemp.save();
            
            // Eliminar la precuenta
            await PreCuenta.findByIdAndDelete(preCuentaId);

            const ticketTempPopulado = await ticketTemp.populate(TICKET_POPULATE_PATHS);
            res.json(ticketTempPopulado);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Imprimir ticket 
    imprimirTicket: async (req, res) => {
        try {
            const { preCuentaId } = req.body;

            // Buscar la precuenta
            const preCuenta = await PreCuenta.findById(preCuentaId)
                .populate(PRECUENTA_POPULATE_PATHS);
            if (!preCuenta) {
                return res.status(404).json({ message: 'PreCuenta no encontrada' });
            }

            // Generar numeración fiscal
            const numeracion = await Tickets.generarNumeroTicket();

            // Crear nuevo ticket
            const ticket = new Tickets({
                numeroTicket: numeracion.numeroTicket,
                serie: numeracion.serie,
                numeroSecuencial: numeracion.numeroSecuencial,
                ejercicioFiscal: numeracion.ejercicioFiscal,
                mesa: preCuenta.mesa,
                camarero: preCuenta.camarero,
                metodoDePago: preCuenta.metodoDePago,
                productos: preCuenta.productos,
                productosEliminados: preCuenta.productosEliminados,
                descuento: preCuenta.descuento,
                subTotal: preCuenta.subTotal,
                total: preCuenta.total,
                estado: 'valido',
                fechaApertura: preCuenta.fechaApertura,
                fechaCierre: new Date()
            });

            await ticket.save();
            
            // Eliminar la precuenta
            await PreCuenta.findByIdAndDelete(preCuentaId);

            const ticketPopulado = await ticket.populate(PRECUENTA_POPULATE_PATHS);
            res.json(ticketPopulado);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = preCuentaController;