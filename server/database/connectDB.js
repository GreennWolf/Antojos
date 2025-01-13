const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const config = require('../config/config');

let mongoServer;

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            return mongoose.connection;
        }

        let uri = config.MONGODB_URI;

        console.log('Connecting to MongoDB...', config.NODE_ENV, config.MONGODB_URI);

        // Si estamos en test, usar MongoDB en memoria
        if (config.NODE_ENV === 'test') {
            mongoServer = await MongoMemoryServer.create();
            uri = mongoServer.getUri();
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB connected to ${config.NODE_ENV === 'test' ? 'test database' : 'production database'}`);
        return conn;
    } catch (error) {
        console.error('Error conectando a MongoDB:', error);
        throw error;
    }
};

const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        if (mongoServer) {
            await mongoServer.stop();
            mongoServer = null;
        }
    } catch (error) {
        console.error('Error desconectando de MongoDB:', error);
        throw error;
    }
};

module.exports = { connectDB, disconnectDB };
