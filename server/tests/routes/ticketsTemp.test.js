// tests/routes/ticketsTemp.test.js
describe('TicketsTemp Routes', () => {
    let authToken;
    let adminUser;
    let salon;
    let mesa;
    let categoria;
    let subCategoria;
    let producto;
    let ingrediente;
    let ticketTemp;

    beforeAll(async () => {
        // Setup básico
        const adminRole = await createAdminRole();
        adminUser = await createAdminUser(adminRole._id);
        authToken = 'test-token';

        // Crear dependencias
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

        // Crear ingrediente
        ingrediente = await request(app)
            .post('/api/ingredientes')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                nombre: 'Ingrediente Test',
                precio: 1.99,
                costo: 0.99,
                stockActual: 100
            });

        // Crear producto con ingredientes
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
                iva: 10,
                ingredientesPermitidos: [ingrediente.body._id]
            });

        producto = await request(app)
            .post('/api/productos')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                nombre: 'Producto Test',
                precio: 10.99,
                costo: 5.99,
                stockActual: 100,
                subCategoria: subCategoria.body._id,
                ingredientes: [{
                    ingrediente: ingrediente.body._id,
                    cantidad: 1,
                    unidad: 'unidad'
                }]
            });
    });

    describe('POST /api/tickets-temp', () => {
        it('should create new ticket temporal', async () => {
            const res = await request(app)
                .post('/api/tickets-temp')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    mesa: mesa.body._id,
                    camarero: adminUser._id
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.mesa).toBe(mesa.body._id);
            expect(res.body.camarero).toBe(adminUser._id);
            ticketTemp = res.body;
        });

        it('should not create ticket if mesa is already open', async () => {
            const res = await request(app)
                .post('/api/tickets-temp')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    mesa: mesa.body._id,
                    camarero: adminUser._id
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/tickets-temp/:id/productos', () => {
        it('should add product to ticket', async () => {
            const res = await request(app)
                .post(`/api/tickets-temp/${ticketTemp._id}/productos`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    producto: producto.body._id,
                    cantidad: 2,
                    precio: producto.body.precio,
                    ingredientes: {
                        excluidos: [],
                        extras: [{
                            ingrediente: ingrediente.body._id,
                            cantidad: 1,
                            costoExtra: 1.99
                        }]
                    }
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.productos).toHaveLength(1);
            expect(res.body.productos[0].cantidad).toBe(2);
            expect(res.body.subTotal).toBe((producto.body.precio * 2) + 1.99);
        });
    });

    describe('DELETE /api/tickets-temp/:id/productos/:productoIndex', () => {
        it('should require authorization code', async () => {
            const res = await request(app)
                .delete(`/api/tickets-temp/${ticketTemp._id}/productos/0`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({});

            expect(res.statusCode).toBe(401);
        });

        it('should remove product with valid authorization', async () => {
            const res = await request(app)
                .delete(`/api/tickets-temp/${ticketTemp._id}/productos/0`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    codigo: '123456' // Código del usuario admin
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.productos).toHaveLength(0);
            expect(res.body.productosEliminados).toHaveLength(1);
        });
    });

    describe('PATCH /api/tickets-temp/:id/descuento', () => {
        it('should apply discount to ticket', async () => {
            // Primero agregar un producto nuevamente
            await request(app)
                .post(`/api/tickets-temp/${ticketTemp._id}/productos`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    producto: producto.body._id,
                    cantidad: 1,
                    precio: producto.body.precio
                });

            const res = await request(app)
                .patch(`/api/tickets-temp/${ticketTemp._id}/descuento`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    descuento: 10,
                    codigo: '123456' // Código del usuario admin
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.descuento).toBe(10);
            expect(res.body.total).toBe(res.body.subTotal * 0.9);
        });
    });

    describe('GET /api/tickets-temp/mesa/:mesaId', () => {
        it('should get ticket by mesa', async () => {
            const res = await request(app)
                .get(`/api/tickets-temp/mesa/${mesa.body._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.mesa).toBe(mesa.body._id);
        });
    });
});