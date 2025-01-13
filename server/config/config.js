require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    MONGODB_URI: process.env.NODE_ENV === 'test' 
        ? process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/antojos_test'
        : process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/antojos',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    NODE_ENV: process.env.NODE_ENV || 'development'
};
