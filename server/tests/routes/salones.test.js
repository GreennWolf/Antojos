// tests/routes/salones.test.js
const request = require('supertest');
const app = require('../../server');
const { createAdminRole, createAdminUser } = require('../helpers/auth.helper');

describe('Salones Routes', () => {
    let authToken;
    let createdSalon;

    beforeAll(async () => {
        const adminRole = await createAdminRole();
        const adminUser = await createAdminUser(adminRole._id);
        authToken = 'test-token'; // Simulamos token
    });

    describe('POST /api/salones', () => {
        it('should create a new salon', async () => {
            const res = await request(app)
                .post('/api/salones')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    nombre: 'Salón Principal',
                    active: true
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('nombre', 'Salón Principal');
            createdSalon = res.body;
        });
    });

    describe('GET /api/salones', () => {
        it('should return all salones', async () => {
            const res = await request(app)
                .get('/api/salones')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    describe('PATCH /api/salones/:id/toggle', () => {
        it('should toggle salon active status', async () => {
            const res = await request(app)
                .patch(`/api/salones/${createdSalon._id}/toggle`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.active).toBe(!createdSalon.active);
        });
    });
});