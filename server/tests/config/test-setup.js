const { connectDB, disconnectDB } = require('../../database/connectDB');
const request = require('supertest');
const app = require('../../server');
const { createAdminRole, createAdminUser } = require('../helpers/auth.helper');
const mongoose = require('mongoose');

let adminRole;
let adminUser;
let authToken;

beforeAll(async () => {
    try {
        // Conectar a la base de datos
        await connectDB();
        
        // Limpiar todas las colecciones
        const collections = await mongoose.connection.db.collections();
        for (const collection of collections) {
            await collection.deleteMany({});
        }

        // Crear datos iniciales
        adminRole = await createAdminRole();
        adminUser = await createAdminUser(adminRole._id);

        // Login para obtener token
        const response = await request(app)
            .post('/api/usuarios/login')
            .send({ codigo: '123456' });

        authToken = response.body.token;
    } catch (error) {
        console.error('Error en setup:', error);
        throw error;
    }
});

afterAll(async () => {
    try {
        await disconnectDB();
    } catch (error) {
        console.error('Error en cleanup:', error);
    }
});

module.exports = {
    getAdminRole: () => adminRole,
    getAdminUser: () => adminUser,
    getAuthToken: () => authToken
};