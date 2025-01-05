// tests/routes/mesas.test.js
describe('Mesas Routes', () => {
    let authToken;
    let createdSalon;
    let createdMesa;

    beforeAll(async () => {
        const adminRole = await createAdminRole();
        const adminUser = await createAdminUser(adminRole._id);
        authToken = 'test-token';

        // Crear un salón para las mesas
        const salonRes = await request(app)
            .post('/api/salones')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ nombre: 'Salón Test' });
        createdSalon = salonRes.body;
    });

    describe('POST /api/mesas', () => {
        it('should create a new mesa', async () => {
            const res = await request(app)
                .post('/api/mesas')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    numero: 1,
                    salon: createdSalon._id,
                    active: true
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('numero', 1);
            createdMesa = res.body;
        });
    });

    describe('GET /api/mesas/salon/:salonId', () => {
        it('should return all mesas for a salon', async () => {
            const res = await request(app)
                .get(`/api/mesas/salon/${createdSalon._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBeGreaterThan(0);
        });
    });
});