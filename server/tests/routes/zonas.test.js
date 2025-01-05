// tests/routes/zonas.test.js
const request = require('supertest');
const app = require('../../server');
const { createAdminRole, createAdminUser } = require('../helpers/auth.helper');

describe('Zonas Routes', () => {
    let authToken;
    let adminUser;
    let zonaCreada;

    beforeAll(async () => {
        // Setup básico
        const adminRole = await createAdminRole();
        adminUser = await createAdminUser(adminRole._id);
        authToken = 'test-token';
    });

    describe('POST /api/zonas', () => {
        it('should create a new zona', async () => {
            const res = await request(app)
                .post('/api/zonas')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    nombre: 'Barra',
                    impresora: 'HP-Barra',
                    cobro: true
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('nombre', 'Barra');
            expect(res.body).toHaveProperty('impresora', 'HP-Barra');
            expect(res.body).toHaveProperty('cobro', true);
            expect(res.body).toHaveProperty('active', true);
            zonaCreada = res.body;
        });

        it('should not create zona with duplicate name', async () => {
            const res = await request(app)
                .post('/api/zonas')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    nombre: 'Barra',
                    impresora: 'HP-Barra-2',
                    cobro: true
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /api/zonas', () => {
        it('should get all zonas', async () => {
            const res = await request(app)
                .get('/api/zonas')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/zonas/:id', () => {
        it('should get zona by id', async () => {
            const res = await request(app)
                .get(`/api/zonas/${zonaCreada._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('nombre', zonaCreada.nombre);
            expect(res.body).toHaveProperty('impresora', zonaCreada.impresora);
        });

        it('should return 404 for non-existent zona', async () => {
            const res = await request(app)
                .get('/api/zonas/654321654321654321654321')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe('PUT /api/zonas/:id', () => {
        it('should update zona', async () => {
            const res = await request(app)
                .put(`/api/zonas/${zonaCreada._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    nombre: 'Barra Principal',
                    impresora: 'HP-Barra-Updated',
                    cobro: false
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('nombre', 'Barra Principal');
            expect(res.body).toHaveProperty('impresora', 'HP-Barra-Updated');
            expect(res.body).toHaveProperty('cobro', false);
        });

        it('should not update zona with invalid id', async () => {
            const res = await request(app)
                .put('/api/zonas/654321654321654321654321')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    nombre: 'Test Invalid Update',
                    impresora: 'Test',
                    cobro: true
                });

            expect(res.statusCode).toBe(404);
        });
    });

    describe('DELETE /api/zonas/:id', () => {
        it('should delete zona', async () => {
            const res = await request(app)
                .delete(`/api/zonas/${zonaCreada._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Zona eliminada');
        });

        it('should return 404 when trying to delete non-existent zona', async () => {
            const res = await request(app)
                .delete('/api/zonas/654321654321654321654321')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe('PATCH /api/zonas/:id/toggle', () => {
        let newZona;

        beforeAll(async () => {
            // Crear nueva zona para probar toggle
            const res = await request(app)
                .post('/api/zonas')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    nombre: 'Zona Toggle Test',
                    impresora: 'HP-Test',
                    cobro: true
                });
            newZona = res.body;
        });

        it('should toggle zona active status', async () => {
            const res = await request(app)
                .patch(`/api/zonas/${newZona._id}/toggle`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.active).toBe(false);

            // Toggle back
            const res2 = await request(app)
                .patch(`/api/zonas/${newZona._id}/toggle`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res2.statusCode).toBe(200);
            expect(res2.body.active).toBe(true);
        });
    });

    afterAll(async () => {
        // Limpiar datos de prueba si es necesario
        // await cleanupTestData();
    });
});