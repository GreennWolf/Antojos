// tests/routes/productos.test.js
describe('Productos Routes', () => {
    let authToken;
    let createdCategoria;
    let createdSubCategoria;
    let createdProducto;

    beforeAll(async () => {
        const adminRole = await createAdminRole();
        const adminUser = await createAdminUser(adminRole._id);
        authToken = 'test-token';

        // Crear categoría y subcategoría necesarias
        const categoriaRes = await request(app)
            .post('/api/categorias')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ nombre: 'Categoría Test' });
        createdCategoria = categoriaRes.body;

        const subCategoriaRes = await request(app)
            .post('/api/subcategorias')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                nombre: 'SubCategoría Test',
                categoria: createdCategoria._id,
                iva: 10
            });
        createdSubCategoria = subCategoriaRes.body;
    });

    describe('POST /api/productos', () => {
        it('should create a new producto', async () => {
            const res = await request(app)
                .post('/api/productos')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    nombre: 'Producto Test',
                    precio: 10.99,
                    costo: 5.99,
                    stockActual: 100,
                    subCategoria: createdSubCategoria._id
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('nombre', 'Producto Test');
            createdProducto = res.body;
        });
    });

    describe('GET /api/productos/subcategoria/:subCategoriaId', () => {
        it('should return all productos for a subcategoria', async () => {
            const res = await request(app)
                .get(`/api/productos/subcategoria/${createdSubCategoria._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    describe('PATCH /api/productos/:id/stock', () => {
        it('should update producto stock', async () => {
            const res = await request(app)
                .patch(`/api/productos/${createdProducto._id}/stock`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    stockActual: 90,
                    stockMinimo: 10
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.stockActual).toBe(90);
        });
    });
});