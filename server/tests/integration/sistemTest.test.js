const request = require('supertest');
const app = require('../../server');
const { getAdminRole, getAdminUser, getAuthToken } = require('../config/test-setup');
const mongoose = require('mongoose');

// Variables globales para todos los tests
let adminRole, adminUser, authToken;
let categoria, subCategoria, ingrediente, producto , producto2;
let salon, mesa, zona, metodoPago, ticketTemp , cliente;

const expectStatusWithMessage = async (res, expectedStatus) => {
    if (res.statusCode !== expectedStatus) {
        console.log('\nError Details:');
        console.log('Status Code:', res.statusCode);
        console.log('Expected:', expectedStatus);
        console.log('Error Message:', res.body.message);
        console.log('Full Response:', JSON.stringify(res.body, null, 2));
    }
    expect(res.statusCode).toBe(expectedStatus);
};

beforeAll(async () => {
    try {
        adminRole = getAdminRole();
        adminUser = getAdminUser();
        authToken = getAuthToken();

        if (!authToken) {
            const loginRes = await request(app)
                .post('/api/usuarios/login')
                .send({ codigo: '123456' });
            
            expect(loginRes.status).toBe(200);
            authToken = loginRes.body.token;
        }
    } catch (error) {
        console.error('Error en beforeAll:', error);
        throw error;
    }
});

describe('Sistema Restaurant Test', () => {
    describe('1. Configuración inicial del sistema', () => {
        describe('1.2 Creación de Usuario Owner', () => {
            it('should login with owner user', async () => {
                const res = await request(app)
                    .post('/api/usuarios/login')
                    .send({
                        codigo: '123456'
                    });
                
                expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('token');
                authToken = res.body.token;
            });
        });
    });

    describe('2. Configuración de Productos', () => {
        describe('2.1 Creación de Categoría', () => {
            it('should create categoria', async () => {
                const res = await request(app)
                    .post('/api/categorias')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        nombre: 'Bebidas',
                        ingrediente: false
                    });

                expect(res.statusCode).toBe(201);
                expect(res.body.nombre).toBe('Bebidas');
                expect(res.body.ingrediente).toBe(false);
                expect(res.body.active).toBe(true);
                
                categoria = res.body;
            
            });

            it('should not create duplicate categoria', async () => {
                expect(categoria).toBeDefined();
                
                const res = await request(app)
                    .post('/api/categorias')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        nombre: 'Bebidas',
                        ingrediente: false
                    });

                expect(res.statusCode).toBe(400);
            });
        });

        describe('2.2 Creación de SubCategoría', () => {
            it('should create subcategoria', async () => {
                expect(categoria).toBeDefined();
                
                const res = await request(app)
                    .post('/api/subcategorias')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        nombre: 'Gaseosas',
                        categoria: categoria._id,
                        iva: 21
                    });

                expect(res.statusCode).toBe(201);
                expect(res.body.nombre).toBe('Gaseosas');
                expect(res.body.categoria).toBe(categoria._id);
                expect(res.body.iva).toBe(21);

                subCategoria = res.body;
            });
        });
        describe('2.3 Creación de Ingrediente', () => {
            it('should create ingrediente', async () => {
                // Primero crear categoría para ingredientes
                const categoriaIngRes = await request(app)
                    .post('/api/categorias')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        nombre: 'Insumos',
                        ingrediente: true
                    });

                expect(categoriaIngRes.statusCode).toBe(201);

                const res = await request(app)
                    .post('/api/ingredientes')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        nombre: 'Hielo',
                        precio: 0.5,
                        costo: 0.1,
                        stockActual: 1000,
                        stockMinimo: 100,
                        categoria: categoriaIngRes.body._id
                    });

                expect(res.statusCode).toBe(201);
                expect(res.body.nombre).toBe('Hielo');
                ingrediente = res.body;
            });
        });

        describe('2.4 Creación de Productos', () => {
            it('should create two different productos', async () => {
                // Create first product (Coca Cola)
                const producto1Res = await request(app)
                    .post('/api/productos')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        nombre: 'Coca Cola',
                        precio: 2.50,
                        costo: 1.00,
                        stockActual: 50,
                        stockMinimo: 10,
                        subCategoria: subCategoria._id,
                        ingredientes: [{
                            ingrediente: ingrediente._id,
                            cantidad: 1,
                            unidad: 'unidad'
                        }]
                    });

                expect(producto1Res.statusCode).toBe(201);
                producto1 = producto1Res.body;

                // Create second product (Sprite)
                const producto2Res = await request(app)
                    .post('/api/productos')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        nombre: 'Sprite',
                        precio: 2.30,
                        costo: 0.90,
                        stockActual: 40,
                        stockMinimo: 8,
                        subCategoria: subCategoria._id,
                        ingredientes: [{
                            ingrediente: ingrediente._id,
                            cantidad: 1,
                            unidad: 'unidad'
                        }]
                    });

                expect(producto2Res.statusCode).toBe(201);
                producto2 = producto2Res.body;
            });
        });
        describe('3. Configuración del Espacio Físico', () => {
            describe('3.1 Creación de Salón', () => {
                it('should create salon', async () => {
                    const res = await request(app)
                        .post('/api/salones')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send({
                            nombre: 'Salón Principal'
                        });
    

                    expect(res.statusCode).toBe(201);
                    expect(res.body.nombre).toBe('Salón Principal');
                    expect(res.body.active).toBe(true);
    
                    salon = res.body;
                });
            });
    
            describe('3.2 Creación de Mesa', () => {
                it('should create mesa', async () => {
                    expect(salon).toBeDefined();

    
                    const res = await request(app)
                        .post('/api/mesas')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send({
                            numero: 1,
                            salon: salon._id
                        });
    

                    expect(res.statusCode).toBe(201);
                    expect(res.body.numero).toBe(1);
                    expect(res.body.salon).toBe(salon._id);
                    expect(res.body.active).toBe(true);
    
                    mesa = res.body;
                });
    
                it('should get mesa with salon populated', async () => {
                    expect(mesa).toBeDefined();

    
                    const res = await request(app)
                        .get(`/api/mesas/${mesa._id}`)
                        .set('Authorization', `Bearer ${authToken}`);
    

                    expect(res.statusCode).toBe(200);
                    expect(res.body.salon).toHaveProperty('nombre', 'Salón Principal');
                });
            });
    
            describe('3.3 Creación de Zona', () => {
                it('should create zona', async () => {
                    const res = await request(app)
                        .post('/api/zonas')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send({
                            nombre: 'Barra',
                            impresora: 'HP-Barra',
                            cobro: true
                        });
    

                    expect(res.statusCode).toBe(201);
                    expect(res.body.nombre).toBe('Barra');
                    expect(res.body.impresora).toBe('HP-Barra');
                    expect(res.body.cobro).toBe(true);
    
                    zona = res.body;
                });
            });
        });
        describe('4. Configuración de Métodos de Pago', () => {
            it('should create metodo de pago', async () => {
                const res = await request(app)
                    .post('/api/metodos-pago')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        nombre: 'Efectivo'
                    });
    
                expect(res.statusCode).toBe(201);
                expect(res.body.nombre).toBe('Efectivo');
                expect(res.body.active).toBe(true);
    
                metodoPago = res.body;
            });
        });
    
        describe('5. Flujo de Ticket', () => {
            describe('5.1 Gestión de Ticket Temporal', () => {
                it('should confirm order with two products', async () => {
                    expect(mesa).toBeDefined();
                    expect(adminUser).toBeDefined();
                    expect(producto1).toBeDefined();
                    expect(producto2).toBeDefined();
    
                    const res = await request(app)
                        .post('/api/tickets-temp/confirmar-pedido')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send({
                            mesa: mesa._id,
                            camarero: adminUser._id,
                            productos: [
                                {
                                    producto: producto1._id,
                                    cantidad: 2,
                                    precio: producto1.precio
                                },
                                {
                                    producto: producto2._id,
                                    cantidad: 1,
                                    precio: producto2.precio
                                }
                            ]
                        });
    
                    expect(res.statusCode).toBe(201);
                    expect(res.body.productos).toHaveLength(2);
                    ticketTemp = res.body;
                });
    
                it('should remove one product', async () => {
                    expect(ticketTemp).toBeDefined();
    
                    const res = await request(app)
                        .post('/api/tickets-temp/remove-producto')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send({
                            codigo: '123456',
                            ticketId: ticketTemp._id,
                            productoId: producto2._id
                        });
    
                    await expectStatusWithMessage(res, 200);
                    expect(res.body.productos).toHaveLength(1);
                    expect(res.body.productosEliminados).toHaveLength(1);
                    ticketTemp = res.body;
                });
    
                it('should apply discount', async () => {
                    expect(ticketTemp).toBeDefined();
    
                    const res = await request(app)
                        .post('/api/tickets-temp/apply-descuento')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send({
                            codigo: '123456',
                            ticketId: ticketTemp._id,
                            descuento: 10 // 10% discount
                        });

                    await expectStatusWithMessage(res, 200);
                    expect(res.body.descuento).toBe(10);
                    ticketTemp = res.body;
                });
    
                it('should close ticket as precuenta', async () => {
                    expect(ticketTemp).toBeDefined();
                    expect(metodoPago).toBeDefined();
    
                    const res = await request(app)
                        .post('/api/tickets-temp/cerrar-mesa')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send({
                            ticketTempId: ticketTemp._id,
                            metodoDePago: metodoPago._id,
                            tipo: 'precuenta'
                        });
    
                    await expectStatusWithMessage(res, 200);
                    preCuenta = res.body;
                });
            });
    
            describe('5.2 Gestión de PreCuenta', () => {
                it('should reopen precuenta', async () => {
                    expect(preCuenta).toBeDefined();
    
                    const res = await request(app)
                        .post('/api/precuentas/reopen')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send({
                            preCuentaId: preCuenta._id
                        });
    
                    await expectStatusWithMessage(res, 200);
                    ticketTemp = res.body;
                });
    
                it('should close reopened ticket as final ticket', async () => {
                    expect(ticketTemp).toBeDefined();
                    expect(metodoPago).toBeDefined();
    
                    const res = await request(app)
                        .post('/api/tickets-temp/cerrar-mesa')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send({
                            ticketTempId: ticketTemp._id,
                            metodoDePago: metodoPago._id
                        });
    
                    await expectStatusWithMessage(res, 200);
                    expect(res.body).toHaveProperty('numeroTicket');
                    expect(res.body.serie).toBe('B');
                    ticket = res.body;
                });
            });
    
            describe('5.3 Gestión de Ticket Final', () => {
                it('should create client for factura A', async () => {
                    const res = await request(app)
                        .post('/api/clientes')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send({
                            nif: 'B12345678',
                            nombre: 'Empresa Test',
                            nombreComercial: 'Test Company S.L.',
                            direccion: {
                                calle: 'Avenida Principal',
                                numero: '123',
                                piso: '4',
                                puerta: 'B',
                                codigoPostal: '28001',
                                localidad: 'Madrid',
                                provincia: 'Madrid',
                                pais: 'España'
                            },
                            contacto: {
                                telefono: '+34911234567',
                                email: 'facturacion@testcompany.com'
                            },
                            regimen: 'general',
                            active: true
                        });
        
                    await expectStatusWithMessage(res, 201);
                    expect(res.body.nif).toBe('B12345678');
                    expect(res.body.nombreComercial).toBe('Test Company S.L.');
                    cliente = res.body;
                });
        
                it('should create factura A from ticket', async () => {
                    expect(ticket).toBeDefined();
                    expect(cliente).toBeDefined();
        
                    const res = await request(app)
                        .post('/api/tickets/factura-a')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send({
                            ticketId: ticket._id,
                            clienteId: cliente._id
                        });
        
                    await expectStatusWithMessage(res, 200);
                    expect(res.body.serie).toBe('A');
                    ticket = res.body;
                });
        
                it('should cancel ticket', async () => {
                    expect(ticket).toBeDefined();
        
                    const res = await request(app)
                        .post('/api/tickets/anular')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send({
                            ticketId: ticket._id,
                            motivoAnulacion: 'Test cancellation'
                        });
        
                    await expectStatusWithMessage(res, 200);
                    expect(res.body.estado).toBe('anulado');
                    expect(res.body.motivoAnulacion).toBe('Test cancellation');
                });
        
                it('should update client after ticket cancellation', async () => {
                    expect(cliente).toBeDefined();
        
                    const res = await request(app)
                        .put(`/api/clientes/${cliente._id}`)
                        .set('Authorization', `Bearer ${authToken}`)
                        .send({
                            nif: 'B12345678',
                            nombre: 'Empresa Test Actualizada',
                            nombreComercial: 'Test Company Updated S.L.',
                            direccion: {
                                calle: 'Avenida Secundaria',
                                numero: '456',
                                piso: '5',
                                puerta: 'C',
                                codigoPostal: '28002',
                                localidad: 'Madrid',
                                provincia: 'Madrid',
                                pais: 'España'
                            },
                            contacto: {
                                telefono: '+34911234568',
                                email: 'nuevo.email@testcompany.com'
                            },
                            regimen: 'general',
                            active: true
                        });
        
                    await expectStatusWithMessage(res, 200);
                    expect(res.body.nombreComercial).toBe('Test Company Updated S.L.');
                    expect(res.body.direccion.calle).toBe('Avenida Secundaria');
                    expect(res.body.contacto.email).toBe('nuevo.email@testcompany.com');
                });
            });
        });
    });
});