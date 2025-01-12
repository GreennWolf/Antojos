// utils/dbHandler.js
const mongoose = require('mongoose');
const { connectDB } = require('../database/connectDB');

const waitForDatabase = async (retries = 5, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        if (mongoose.connection.readyState === 1) {
            return true;
        }
        await connectDB();
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    throw new Error('No se pudo establecer conexión con la base de datos');
};

const waitForCollection = async (modelName, expectedDocs = 1, retries = 5, delay = 500) => {
    const Model = mongoose.model(modelName);
    
    for (let i = 0; i < retries; i++) {
        const count = await Model.countDocuments();
        if (count >= expectedDocs) {
            return true;
        }
        // console.log(`Esperando documentos en ${modelName}. Intento ${i + 1}, encontrados: ${count}`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    throw new Error(`No se encontraron documentos en la colección ${modelName}`);
};

module.exports = { waitForDatabase, waitForCollection };