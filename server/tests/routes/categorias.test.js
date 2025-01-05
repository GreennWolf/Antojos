// tests/routes/categorias.test.js
const request = require('supertest');
const app = require('../../server');
const { createAdminRole, createAdminUser } = require('../helpers/auth.helper');

describe('Categorias Routes', () => {
    let adminUser;
    let authToken;

    beforeAll(async () => {
        const adminRole = await createAdminRole();
        adminUser = await createAdminUser(adminRole._id);
        // Aquí normalmente harías login para obtener el token
        // Por ahora simularemos el token
        authToken = 'test-token';
    });

    describe('POST /api/categorias', () => {
        it('should create a new categoria', async () => {
            const res = await request(app)
                .post('/api/categorias')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    nombre: 'Categoría Test',
                    ingrediente: false
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('nombre', 'Categoría Test');
        });
    });

    describe('GET /api/categorias', () => {
        it('should return all categorias', async () => {
            const res = await request(app)
                .get('/api/categorias')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
        });
    });
});