module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./tests/setup.js'], // Configuración para ejecutar antes de las pruebas
    testMatch: ['**/tests/**/*.test.js'],    // Coincidir solo con archivos .test.js dentro de la carpeta tests
    verbose: true,                           // Mostrar información detallada sobre las pruebas
    detectOpenHandles: true,                 // Detectar handles abiertos para evitar warnings
    forceExit: true,                         // Salir forzosamente después de las pruebas
};
