// tests/routes/tickets.test.js
const request = require('supertest');
const app = require('../../server');
const { createAdminRole, createAdminUser } = require('../helpers/auth.helper');

describe('Tickets Routes', () => {
   let authToken;
   let adminUser;
   let salon;
   let mesa;
   let metodoPago;
   let categoria;
   let subCategoria;
   let producto;
   let cliente;
   let ticketTemp;
   let ticket;

   beforeAll(async () => {
       // Crear rol y usuario admin
       const adminRole = await createAdminRole();
       adminUser = await createAdminUser(adminRole._id);
       authToken = 'test-token';

       // Crear todas las dependencias necesarias
       // 1. Crear salón y mesa
       salon = await request(app)
           .post('/api/salones')
           .set('Authorization', `Bearer ${authToken}`)
           .send({ nombre: 'Salón Test' });

       mesa = await request(app)
           .post('/api/mesas')
           .set('Authorization', `Bearer ${authToken}`)
           .send({
               numero: 1,
               salon: salon.body._id
           });

       // 2. Crear método de pago
       metodoPago = await request(app)
           .post('/api/metodos-pago')
           .set('Authorization', `Bearer ${authToken}`)
           .send({ nombre: 'Efectivo Test' });

       // 3. Crear categoría, subcategoría y producto
       categoria = await request(app)
           .post('/api/categorias')
           .set('Authorization', `Bearer ${authToken}`)
           .send({ nombre: 'Categoría Test' });

       subCategoria = await request(app)
           .post('/api/subcategorias')
           .set('Authorization', `Bearer ${authToken}`)
           .send({
               nombre: 'SubCategoría Test',
               categoria: categoria.body._id,
               iva: 10
           });

       producto = await request(app)
           .post('/api/productos')
           .set('Authorization', `Bearer ${authToken}`)
           .send({
               nombre: 'Producto Test',
               precio: 10.99,
               costo: 5.99,
               stockActual: 100,
               subCategoria: subCategoria.body._id
           });

       // 4. Crear cliente para factura A
       cliente = await request(app)
           .post('/api/clientes')
           .set('Authorization', `Bearer ${authToken}`)
           .send({
               nif: 'B12345678',
               nombre: 'Cliente Test',
               direccion: {
                   calle: 'Test',
                   numero: '1',
                   codigoPostal: '28001',
                   localidad: 'Madrid',
                   provincia: 'Madrid'
               }
           });

       // 5. Crear ticket temporal y convertirlo a ticket
       ticketTemp = await request(app)
           .post('/api/tickets-temp')
           .set('Authorization', `Bearer ${authToken}`)
           .send({
               mesa: mesa.body._id,
               camarero: adminUser._id
           });

       // Agregar producto al ticket temporal
       await request(app)
           .post(`/api/tickets-temp/${ticketTemp.body._id}/productos`)
           .set('Authorization', `Bearer ${authToken}`)
           .send({
               producto: producto.body._id,
               cantidad: 2,
               precio: producto.body.precio
           });

       // Convertir a ticket
       ticket = await request(app)
           .post('/api/tickets-temp/cerrar')
           .set('Authorization', `Bearer ${authToken}`)
           .send({
               ticketTempId: ticketTemp.body._id,
               metodoPagoId: metodoPago.body._id
           });
   });

   describe('GET /api/tickets', () => {
       it('should get all tickets', async () => {
           const res = await request(app)
               .get('/api/tickets')
               .set('Authorization', `Bearer ${authToken}`);

           expect(res.statusCode).toBe(200);
           expect(Array.isArray(res.body)).toBeTruthy();
           expect(res.body.length).toBeGreaterThan(0);
       });
   });

   describe('PATCH /api/tickets/metodo-pago', () => {
       it('should modify payment method of a ticket', async () => {
           // Primero crear nuevo método de pago
           const nuevoMetodoPago = await request(app)
               .post('/api/metodos-pago')
               .set('Authorization', `Bearer ${authToken}`)
               .send({ nombre: 'Tarjeta Test' });

           const res = await request(app)
               .patch('/api/tickets/metodo-pago')
               .set('Authorization', `Bearer ${authToken}`)
               .send({
                   ticketId: ticket.body._id,
                   metodoPagoId: nuevoMetodoPago.body._id
               });

           expect(res.statusCode).toBe(200);
           expect(res.body.metodoDePago).toBe(nuevoMetodoPago.body._id);
       });
   });

   describe('POST /api/tickets/factura-a', () => {
       it('should create factura A from ticket', async () => {
           const res = await request(app)
               .post('/api/tickets/factura-a')
               .set('Authorization', `Bearer ${authToken}`)
               .send({
                   ticketId: ticket.body._id,
                   clienteId: cliente.body._id
               });

           expect(res.statusCode).toBe(200);
           expect(res.body.serie).toBe('A');
           expect(res.body.cliente).toBeDefined();
           expect(res.body.cliente).toBe(cliente.body._id);
       });
   });

   describe('POST /api/tickets/anular', () => {
       it('should anular ticket', async () => {
           const res = await request(app)
               .post('/api/tickets/anular')
               .set('Authorization', `Bearer ${authToken}`)
               .send({
                   ticketId: ticket.body._id,
                   motivoAnulacion: 'Test anulación'
               });

           expect(res.statusCode).toBe(200);
           expect(res.body.estado).toBe('anulado');
           expect(res.body.motivoAnulacion).toBe('Test anulación');
       });
   });

   describe('POST /api/tickets/reopen', () => {
       it('should reopen a ticket as ticketTemp', async () => {
           const res = await request(app)
               .post('/api/tickets/reopen')
               .set('Authorization', `Bearer ${authToken}`)
               .send({
                   ticketId: ticket.body._id
               });

           expect(res.statusCode).toBe(200);
           expect(res.body).toHaveProperty('ticketAnulado');
           expect(res.body).toHaveProperty('nuevoTicketTemp');
           expect(res.body.ticketAnulado.estado).toBe('anulado');
           expect(res.body.nuevoTicketTemp.mesa).toBe(mesa.body._id);
       });
   });
});