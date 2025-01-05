// tests/routes/preCuenta.test.js
const request = require('supertest');
const app = require('../../server');
const { createAdminRole, createAdminUser } = require('../helpers/auth.helper');

describe('PreCuenta Routes', () => {
   let authToken;
   let adminUser;
   let mesa;
   let ticketTemp;
   let preCuenta;
   let metodoPago;
   let categoria;
   let subCategoria;
   let producto;

   beforeAll(async () => {
       // Setup básico
       const adminRole = await createAdminRole();
       adminUser = await createAdminUser(adminRole._id);
       authToken = 'test-token';

       // Crear salón y mesa
       const salon = await request(app)
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

       // Crear método de pago
       metodoPago = await request(app)
           .post('/api/metodos-pago')
           .set('Authorization', `Bearer ${authToken}`)
           .send({ nombre: 'Efectivo Test' });

       // Crear categoría y subcategoría
       categoria = await request(app)
           .post('/api/categorias')
           .set('Authorization', `Bearer ${authToken}`)
           .send({ 
               nombre: 'Categoría Test',
               ingrediente: false
           });

       subCategoria = await request(app)
           .post('/api/subcategorias')
           .set('Authorization', `Bearer ${authToken}`)
           .send({
               nombre: 'SubCategoría Test',
               categoria: categoria.body._id,
               iva: 10
           });

       // Crear producto
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

       // Crear ticketTemp
       ticketTemp = await request(app)
           .post('/api/tickets-temp')
           .set('Authorization', `Bearer ${authToken}`)
           .send({
               mesa: mesa.body._id,
               camarero: adminUser._id
           });

       // Agregar productos al ticketTemp
       await request(app)
           .post(`/api/tickets-temp/${ticketTemp.body._id}/productos`)
           .set('Authorization', `Bearer ${authToken}`)
           .send({
               producto: producto.body._id,
               cantidad: 2,
               precio: producto.body.precio
           });
   });

   describe('GET /api/precuentas', () => {
       it('should get all precuentas', async () => {
           const res = await request(app)
               .get('/api/precuentas')
               .set('Authorization', `Bearer ${authToken}`);

           expect(res.statusCode).toBe(200);
           expect(Array.isArray(res.body)).toBeTruthy();
       });
   });

   describe('PATCH /api/precuentas/metodo-pago', () => {
       beforeAll(async () => {
           // Crear preCuenta desde ticketTemp
           const preCuentaRes = await request(app)
               .post('/api/tickets-temp/precuenta')
               .set('Authorization', `Bearer ${authToken}`)
               .send({
                   ticketTempId: ticketTemp.body._id
               });
           
           preCuenta = preCuentaRes.body;
       });

       it('should change payment method', async () => {
           const nuevoMetodoPago = await request(app)
               .post('/api/metodos-pago')
               .set('Authorization', `Bearer ${authToken}`)
               .send({ nombre: 'Tarjeta Test' });

           const res = await request(app)
               .patch('/api/precuentas/metodo-pago')
               .set('Authorization', `Bearer ${authToken}`)
               .send({
                   preCuentaId: preCuenta._id,
                   metodoPagoId: nuevoMetodoPago.body._id
               });

           expect(res.statusCode).toBe(200);
           expect(res.body.metodoDePago).toBe(nuevoMetodoPago.body._id);
       });
   });

   describe('POST /api/precuentas/reopen', () => {
       it('should reopen preCuenta as ticketTemp', async () => {
           const res = await request(app)
               .post('/api/precuentas/reopen')
               .set('Authorization', `Bearer ${authToken}`)
               .send({
                   preCuentaId: preCuenta._id
               });

           expect(res.statusCode).toBe(200);
           expect(res.body.mesa).toBe(mesa.body._id);
           expect(res.body.productos).toHaveLength(preCuenta.productos.length);
       });
   });

   describe('POST /api/precuentas/imprimir', () => {
       it('should convert preCuenta to ticket', async () => {
           // Primero crear nueva preCuenta
           const nuevaPreCuentaRes = await request(app)
               .post('/api/tickets-temp/precuenta')
               .set('Authorization', `Bearer ${authToken}`)
               .send({
                   ticketTempId: ticketTemp.body._id
               });

           const res = await request(app)
               .post('/api/precuentas/imprimir')
               .set('Authorization', `Bearer ${authToken}`)
               .send({
                   preCuentaId: nuevaPreCuentaRes.body._id
               });

           expect(res.statusCode).toBe(200);
           expect(res.body).toHaveProperty('numeroTicket');
           expect(res.body.serie).toBe('B');
           expect(res.body.estado).toBe('valido');
           expect(res.body.productos).toHaveLength(ticketTemp.body.productos.length);
           expect(res.body.total).toBe(ticketTemp.body.total);
       });
   });

   afterAll(async () => {
       // Limpiar datos de prueba si es necesario
       // await cleanupTestData();
   });
});