// controllers/TicketController.js
const ClientesModels = require('../database/models/ClientesModels');
const Tickets = require('../database/models/Tickets');
const TicketsTemps = require('../database/models/TicketsTemps');

const TICKET_POPULATE_PATHS = [
    { path: 'mesa' },
    { path: 'camarero' },
    { path: 'metodoDePago' },
    { path: 'productos.producto' },
    { path: 'productos.ingredientes.excluidos.ingrediente' },
    { path: 'productos.ingredientes.extras.ingrediente' },
];

const populateTicket = async (ticket) => {
    const paths = [
        'mesa',
        'camarero',
        'metodoDePago',
        'productos.producto',
        'productos.ingredientes.excluidos.ingrediente',
        'productos.ingredientes.extras.ingrediente'
    ];

    // Solo añadir cliente si existe
    if (ticket.cliente) {
        paths.push('cliente');
    }

    return await ticket.populate(paths);
};

const TICKETTemp_POPULATE_PATHS = [
    { path: 'mesa' },
    { path: 'camarero' },
    { path: 'productos.producto' },
    { path: 'productos.ingredientes.excluidos.ingrediente' },
    { path: 'productos.ingredientes.extras.ingrediente' },
];

const ticketController = {
    // Obtener todos los tickets
    getAll: async (req, res) => {
        try {
            const tickets = await Tickets.find()
                .populate(TICKET_POPULATE_PATHS);
            res.json(tickets);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Modificar método de pago
    modifyMetodoPago: async (req, res) => {
        try {
            const { ticketId, metodoPagoId } = req.body;

            const ticket = await Tickets.findById(ticketId);
            if (!ticket) {
                return res.status(404).json({ message: 'Ticket no encontrado' });
            }

            ticket.metodoDePago = metodoPagoId;
            await ticket.save();

            const ticketPopulado = await ticket.populate(TICKET_POPULATE_PATHS);
            res.json(ticketPopulado);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Crear factura A
    createFacturaA: async (req, res) => {
        try {
            const { ticketId, clienteId } = req.body;

            const cliente = await ClientesModels.findById(clienteId);
            if(!cliente) { 
                return res.status(404).json({ message: 'Cliente no encontrado' });
             }

            const ticket = await Tickets.findById(ticketId);
            if (!ticket) {
                return res.status(404).json({ message: 'Ticket no encontrado' });
            }

            // Cambiar serie a 'A' para factura
            const numeracion = await Tickets.generarNumeroTicket('A');
            
            ticket.serie = numeracion.serie;
            ticket.numeroTicket = numeracion.numeroTicket;
            ticket.numeroSecuencial = numeracion.numeroSecuencial;
            ticket.cliente = clienteId;

            await ticket.save();
            
            const ticketPopulado = await populateTicket(ticket);
            res.json(ticketPopulado);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Anular ticket
    anularTicket: async (req, res) => {
        try {
            const { ticketId, motivoAnulacion } = req.body;

            const ticket = await Tickets.findById(ticketId);
            if (!ticket) {
                return res.status(404).json({ message: 'Ticket no encontrado' });
            }

            ticket.estado = 'anulado';
            ticket.motivoAnulacion = motivoAnulacion;
            await ticket.save();

            const ticketPopulado = await populateTicket(ticket);
            res.json(ticketPopulado);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Reabrir ticket
    reopen: async (req, res) => {
        try {
            const { ticketId } = req.body;

            // Buscar ticket original
            const ticketOriginal = await Tickets.findById(ticketId);
            if (!ticketOriginal) {
                return res.status(404).json({ message: 'Ticket no encontrado' });
            }

            // Anular ticket original
            ticketOriginal.estado = 'anulado';
            ticketOriginal.motivoAnulacion = 'Reapertura de mesa - Cliente aún no quería la cuenta';
            await ticketOriginal.save();

            // Crear nuevo ticket temporal
            const ticketTemp = new TicketsTemps({
                mesa: ticketOriginal.mesa,
                camarero: ticketOriginal.camarero,
                productos: ticketOriginal.productos,
                descuento: ticketOriginal.descuento,
                subTotal: ticketOriginal.subTotal,
                total: ticketOriginal.total
            });

            await ticketTemp.save();
            
            const ticketTempPopulado = (await ticketTemp.populate(TICKETTemp_POPULATE_PATHS))
            res.json({
                ticketAnulado: ticketOriginal,
                nuevoTicketTemp: ticketTempPopulado
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = ticketController;