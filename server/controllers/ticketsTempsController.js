const TicketsTemps = require('../database/models/TicketsTemps');
const Usuarios = require('../database/models/UsuariosModel');
const Productos = require('../database/models/ProductosModel');
const Ingredientes = require('../database/models/IngredientesModel');
const Tickets = require('../database/models/Tickets');
const PreCuenta = require('../database/models/PreCuentaModel');
const bcrypt = require('bcryptjs');
const PRIVILEGES  = require('../constants/privileges');

const TICKET_POPULATE_PATHS = [
    { path: 'mesa' },
    { path: 'camarero' },
    {
      path: 'productos.producto',
      populate: {
        path: 'subCategoria',
        populate: [
          { path: 'Zona' },
          { path: 'ingredientesPermitidos' }
        ]
      }
    },
    { path: 'productos.ingredientes.excluidos.ingrediente' },
    { path: 'productos.ingredientes.extras.ingrediente' },
  ];

const ticketsTempsController = {
    // Crear nuevo ticket (abrir mesa)
    confirmarPedido: async (req, res) => {
        try {
            const { mesa, camarero, productos, subtotal, total } = req.body;
    
            // Buscar si ya existe una mesa abierta
            let ticket = await TicketsTemps.findOne({ mesa });
    
            if (!ticket) {
                // Crear nueva mesa abierta
                ticket = new TicketsTemps({ 
                    mesa, 
                    camarero, 
                    productos: productos.map(p => ({
                        ...p,
                        uid: p.uid || `${p.producto}${Date.now()}`  // Aseguramos que tenga uid
                    })), 
                    subtotal, 
                    total 
                });
                await ticket.save();
            } else {
                // Actualizar mesa abierta con los nuevos productos
                for (const nuevoProducto of productos) {
                    const productoExistente = ticket.productos.find(p => p.uid === nuevoProducto.uid);
    
                    if (productoExistente) {
                        // Si el producto ya existe con el mismo uid, actualizar sus propiedades
                        Object.assign(productoExistente, {
                            ...nuevoProducto,
                            cantidad: productoExistente.cantidad + nuevoProducto.cantidad
                        });
                    } else {
                        // Si no existe el uid, es un producto nuevo
                        ticket.productos.push({
                            ...nuevoProducto,
                            uid: nuevoProducto.uid || `${nuevoProducto.producto}${Date.now()}`
                        });
                    }
                }
            }
    
            // Descontar del stock de productos e ingredientes
            for (const nuevoProducto of productos) {
                const producto = await Productos.findById(nuevoProducto.producto);
                if (!producto) throw new Error(`Producto no encontrado: ${nuevoProducto.producto}`);
    
                // Descontar del stock del producto
                if (producto.stockActual < nuevoProducto.cantidad) {
                    throw new Error(`Stock insuficiente para el producto: ${producto.nombre}`);
                }
                producto.stockActual -= nuevoProducto.cantidad;
                await producto.save();
    
                // Descontar del stock de los ingredientes base
                for (const ingredienteInfo of producto.ingredientes) {
                    const ingrediente = await Ingredientes.findById(ingredienteInfo.ingrediente);
                    if (!ingrediente) throw new Error(`Ingrediente no encontrado: ${ingredienteInfo.ingrediente}`);
    
                    const cantidadDescontar = ingredienteInfo.cantidad * nuevoProducto.cantidad;
                    if (ingrediente.stockActual < cantidadDescontar) {
                        throw new Error(`Stock insuficiente para el ingrediente: ${ingrediente.nombre}`);
                    }
                    ingrediente.stockActual -= cantidadDescontar;
                    await ingrediente.save();
                }
    
                // Descontar stock de ingredientes extras si existen
                if (nuevoProducto.ingredientes?.extras?.length > 0) {
                    for (const extra of nuevoProducto.ingredientes.extras) {
                        const ingrediente = await Ingredientes.findById(extra.ingrediente);
                        if (!ingrediente) throw new Error(`Ingrediente extra no encontrado: ${extra.ingrediente}`);
    
                        const cantidadDescontar = extra.cantidad * nuevoProducto.cantidad;
                        if (ingrediente.stockActual < cantidadDescontar) {
                            throw new Error(`Stock insuficiente para el ingrediente extra: ${ingrediente.nombre}`);
                        }
                        ingrediente.stockActual -= cantidadDescontar;
                        await ingrediente.save();
                    }
                }
            }
    
            ticket.calcularTotal();
            await ticket.save();
    
            const ticketPopulado = await ticket.populate(TICKET_POPULATE_PATHS);
            res.status(201).json(ticketPopulado);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Eliminar producto (requiere autorización especial)
    removeProducto: async (req, res) => {
        try {
            const { codigo, productoId, ticketId, ingredienteId } = req.body;
            console.log(productoId)
            // Buscar todos los usuarios activos
            const usuarios = await Usuarios.find({ active: true }).populate('rol');
            
            // Encontrar el usuario que coincida con el código usando bcrypt
            let usuarioAutorizado = null;
            for (const usuario of usuarios) {
                const coincide = await bcrypt.compare(codigo, usuario.codigo);
                if (coincide) {
                    usuarioAutorizado = usuario;
                    break;
                }
            }
    
            if (!usuarioAutorizado) {
                return res.status(401).json({ message: 'Usuario no encontrado o código incorrecto' });
            }
    
            // Verificar permisos
            if (!usuarioAutorizado.rol || !usuarioAutorizado.rol.permisos.TICKETS_TEMP.REMOVE_PRODUCTOS) {
                return res.status(403).json({ message: 'No tienes permisos para eliminar productos o ingredientes' });
            }
    
            const ticket = await TicketsTemps.findById(ticketId);
            if (!ticket) return res.status(404).json({ message: 'Ticket no encontrado' });
    
            const productoIndex = ticket.productos.findIndex(p => p.uid === productoId);
            if (productoIndex === -1) return res.status(404).json({ message: 'Producto no encontrado en el ticket' });
    
            const producto = ticket.productos[productoIndex];
    
            if (ingredienteId) {
                // Lógica para ingredientes igual que antes...
                const excluidoIndex = producto.ingredientes.excluidos.findIndex(
                    excluido => excluido.ingrediente.toString() === ingredienteId
                );
    
                if (excluidoIndex !== -1) {
                    const ingrediente = await Ingredientes.findById(ingredienteId);
                    if (ingrediente) {
                        ingrediente.stockActual += producto.cantidad;
                        await ingrediente.save();
                    }
                    producto.ingredientes.excluidos.splice(excluidoIndex, 1);
                } else {
                    const extraIndex = producto.ingredientes.extras.findIndex(
                        extra => extra.ingrediente.toString() === ingredienteId
                    );
    
                    if (extraIndex !== -1) {
                        const extra = producto.ingredientes.extras[extraIndex];
                        const ingrediente = await Ingredientes.findById(ingredienteId);
                        if (ingrediente) {
                            ingrediente.stockActual += extra.cantidad * producto.cantidad;
                            await ingrediente.save();
                        }
                        producto.ingredientes.extras.splice(extraIndex, 1);
                    } else {
                        return res.status(404).json({ message: 'Ingrediente no encontrado en el producto' });
                    }
                }
            } else {
                // Guardar el producto eliminado con la nueva estructura
                ticket.productosEliminados.push({
                    producto: producto.producto._id,
                    ingredientes: {
                        excluidos: producto.ingredientes.excluidos.map(exc => ({
                            ingrediente: exc.ingrediente
                        })),
                        extras: producto.ingredientes.extras.map(ext => ({
                            ingrediente: ext.ingrediente,
                            costoExtra: ext.costoExtra,
                            cantidad: ext.cantidad
                        }))
                    },
                    cantidad: producto.cantidad,
                    precio: producto.precio,
                    observaciones: producto.observaciones,
                    horaEliminacion: new Date(),
                    eliminadoPor: usuarioAutorizado._id
                });
    
                const productoDb = await Productos.findById(producto.producto);
                if (productoDb) {
                    productoDb.stockActual += producto.cantidad;
                    await productoDb.save();
    
                    for (const ingr of productoDb.ingredientes) {
                        const ingrediente = await Ingredientes.findById(ingr.ingrediente);
                        if (ingrediente) {
                            ingrediente.stockActual += ingr.cantidad * producto.cantidad;
                            await ingrediente.save();
                        }
                    }
                }
    
                ticket.productos.splice(productoIndex, 1);
            }
    
            ticket.calcularTotal();
            await ticket.save();
    
            const ticketPopulado = await ticket.populate(TICKET_POPULATE_PATHS);
            res.json(ticketPopulado);
        } catch (error) {
            console.log('Error en removeProducto:', error);
            res.status(400).json({ message: error.message });
        }
    },
    

    // Aplicar descuento
    applyDescuento: async (req, res) => {
        try {
            const { descuento, codigo, ticketId } = req.body;
    
            // Validar usuario y privilegios
            const usuarios = await Usuarios.find({ active: true }).populate('rol');
            
            // Encontrar el usuario que coincida con el código usando bcrypt
            let usuarioAutorizado = null;
            for (const usuario of usuarios) {
                const coincide = await bcrypt.compare(codigo, usuario.codigo);
                if (coincide) {
                    usuarioAutorizado = usuario;
                    break;
                }
            }
    
            if (!usuarioAutorizado) {
                return res.status(401).json({ message: 'Usuario no encontrado o código incorrecto' });
            }
    
            // Verificar permisos
            if (!usuarioAutorizado.rol || !usuarioAutorizado.rol.permisos[PRIVILEGES.TICKETS_TEMP.REMOVE_PRODUCTOS]) {
                return res.status(403).json({ message: 'No tienes permisos para eliminar productos o ingredientes' });
            }
    
            // Buscar el ticket correspondiente
            const ticket = await TicketsTemps.findById(ticketId);
            if (!ticket) return res.status(404).json({ message: 'Ticket no encontrado' });
    
            // Aplicar el descuento y recalcular el total
            ticket.descuento = descuento;
            ticket.calcularTotal();
            await ticket.save();
    
            const ticketPopulado = await ticket.populate(TICKET_POPULATE_PATHS);
            res.json(ticketPopulado);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Obtener ticket por mesa
    getByMesa: async (req, res) => {
        try {
            const ticket = await TicketsTemps.findOne({ mesa: req.params.mesaId }).populate(TICKET_POPULATE_PATHS);
            if (!ticket) return res.status(404).json({ message: 'Ticket no encontrado' });
            res.json(ticket);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    cerrarMesa: async (req, res) => {
        try {
            const { metodoDePago, ticketTempId, tipo } = req.body;
    
            // Buscar el TicketTemp correspondiente
            const ticketTemp = await TicketsTemps.findById(ticketTempId);
            if (!ticketTemp) return res.status(404).json({ message: 'Ticket temporal no encontrado' });
            console.log(metodoDePago , 'method')
            if (tipo === 'precuenta') {
                // Crear PreCuenta
                const preCuenta = new PreCuenta({
                    mesa: ticketTemp.mesa,
                    camarero: ticketTemp.camarero,
                    metodoDePago: metodoDePago,
                    productos: ticketTemp.productos,
                    productosEliminados: ticketTemp.productosEliminados,
                    descuento: ticketTemp.descuento,
                    subTotal: ticketTemp.subTotal,
                    total: ticketTemp.total,
                    fechaApertura: ticketTemp.fechaApertura
                });

                await preCuenta.save();
                await TicketsTemps.findByIdAndDelete(ticketTempId);

                const preCuentaPopulada = await preCuenta.populate(TICKET_POPULATE_PATHS);
                return res.json(preCuentaPopulada);

            } else {
                // Generar numeración para ticket
                const numeracion = await Tickets.generarNumeroTicket();
    
                // Crear ticket
                const nuevoTicket = new Tickets({
                    numeroTicket: numeracion.numeroTicket,
                    serie: numeracion.serie,
                    numeroSecuencial: numeracion.numeroSecuencial,
                    ejercicioFiscal: numeracion.ejercicioFiscal,
                    mesa: ticketTemp.mesa,
                    camarero: ticketTemp.camarero,
                    metodoDePago: metodoDePago,
                    productos: ticketTemp.productos,
                    productosEliminados: ticketTemp.productosEliminados,
                    descuento: ticketTemp.descuento,
                    subTotal: ticketTemp.subTotal,
                    total: ticketTemp.total,
                    cliente: ticketTemp.cliente,
                    estado: 'valido',
                    fechaApertura: ticketTemp.fechaApertura,
                    fechaCierre: new Date()
                });

                await nuevoTicket.save();
                await TicketsTemps.findByIdAndDelete(ticketTempId);

                const ticketPopulado = await nuevoTicket.populate(TICKET_POPULATE_PATHS);
                return res.json(ticketPopulado);
            }

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // controllers/ticketsTempController.js
    restarCantidad: async (req, res) => {
        try {
            const { codigo, productoId, ticketId, cantidad } = req.body;

            console.log(req.body)

            // Buscar todos los usuarios activos
            const usuarios = await Usuarios.find({ active: true }).populate('rol');
            
            // Encontrar el usuario que coincida con el código usando bcrypt
            let usuarioAutorizado = null;
            for (const usuario of usuarios) {
                const coincide = await bcrypt.compare(codigo, usuario.codigo);
                if (coincide) {
                    usuarioAutorizado = usuario;
                    break;
                }
            }

            if (!usuarioAutorizado) {
                return res.status(401).json({ message: 'Usuario no encontrado o código incorrecto' });
            }

            // Verificar permisos
            if (!usuarioAutorizado.rol || !usuarioAutorizado.rol.permisos.TICKETS_TEMP.REMOVE_PRODUCTOS) {
                return res.status(403).json({ message: 'No tienes permisos para modificar productos' });
            }

            const ticket = await TicketsTemps.findById(ticketId);
            if (!ticket) return res.status(404).json({ message: 'Ticket no encontrado' });

            const productoIndex = ticket.productos.findIndex(p => p.uid === productoId);
            if (productoIndex === -1) return res.status(404).json({ message: 'Producto no encontrado en el ticket' });

            const producto = ticket.productos[productoIndex];
            
            // Verificar que la cantidad a restar no sea mayor que la cantidad actual
            if (cantidad >= producto.cantidad) {
                return res.status(400).json({ message: 'La cantidad a restar no puede ser mayor o igual a la cantidad actual' });
            }

            // Guardar la cantidad restada en productosEliminados
            ticket.productosEliminados.push({
                producto: producto.producto._id,
                ingredientes: {
                    excluidos: producto.ingredientes.excluidos.map(exc => ({
                        ingrediente: exc.ingrediente
                    })),
                    extras: producto.ingredientes.extras.map(ext => ({
                        ingrediente: ext.ingrediente,
                        costoExtra: ext.costoExtra,
                        cantidad: ext.cantidad
                    }))
                },
                cantidad: cantidad, // La cantidad que se está restando
                precio: producto.precio,
                observaciones: producto.observaciones,
                horaEliminacion: new Date(),
                eliminadoPor: usuarioAutorizado._id
            });

            // Actualizar el stock
            const productoDb = await Productos.findById(producto.producto);
            if (productoDb) {
                productoDb.stockActual += cantidad;
                await productoDb.save();

                for (const ingr of productoDb.ingredientes) {
                    const ingrediente = await Ingredientes.findById(ingr.ingrediente);
                    if (ingrediente) {
                        ingrediente.stockActual += ingr.cantidad * cantidad;
                        await ingrediente.save();
                    }
                }
            }

            // Actualizar la cantidad del producto
            producto.cantidad -= cantidad;

            ticket.calcularTotal();
            await ticket.save();

            const ticketPopulado = await ticket.populate(TICKET_POPULATE_PATHS);
            res.json(ticketPopulado);
        } catch (error) {
            console.log('Error en restarCantidad:', error);
            res.status(400).json({ message: error.message });
        }
    },

    getAllMesasAbiertas: async (req, res) => {
        try {
            // Obtener todos los TicketsTemps
            const ticketsTemps = await TicketsTemps.find().populate(TICKET_POPULATE_PATHS);
    
            res.status(200).json(ticketsTemps);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    juntarMesa: async (req, res) => {
        try {
            const { mesaPrincipalId, mesasSecundariasIds } = req.body;
    
            // Buscar el ticket de la mesa principal
            const mesaPrincipal = await TicketsTemps.findOne({ mesa: mesaPrincipalId });
            if (!mesaPrincipal) return res.status(404).json({ message: 'Mesa principal no encontrada' });
    
            // Buscar los tickets de las mesas secundarias
            const mesasSecundarias = await TicketsTemps.find({ mesa: { $in: mesasSecundariasIds } });
            if (mesasSecundarias.length === 0) return res.status(404).json({ message: 'No se encontraron mesas secundarias' });
    
            // Combinar productos y productos eliminados de las mesas secundarias en la mesa principal
            for (const mesaSecundaria of mesasSecundarias) {
                // Combinar productos
                for (const productoSecundario of mesaSecundaria.productos) {
                    const productoExistente = mesaPrincipal.productos.find(
                        p => p.producto.toString() === productoSecundario.producto.toString()
                    );
    
                    if (productoExistente) {
                        // Si el producto ya existe, sumar la cantidad
                        productoExistente.cantidad += productoSecundario.cantidad;
                    } else {
                        // Si no existe, agregarlo como nuevo producto
                        mesaPrincipal.productos.push(productoSecundario);
                    }
                }
    
                // Combinar productos eliminados
                mesaPrincipal.productosEliminados.push(...mesaSecundaria.productosEliminados);
            }
    
            // Guardar los cambios en la mesa principal
            mesaPrincipal.calcularTotal();
            await mesaPrincipal.save();
    
            // Eliminar los tickets temporales de las mesas secundarias
            await TicketsTemps.deleteMany({ mesa: { $in: mesasSecundariasIds } });
    
            // Devolver el ticket actualizado de la mesa principal
            const ticketPopulado = await mesaPrincipal.populate(TICKET_POPULATE_PATHS);
            res.json(ticketPopulado);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
    
    
};

module.exports = ticketsTempsController;
