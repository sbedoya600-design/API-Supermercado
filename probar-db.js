
const conexion = require('./db');

async function probarConexion() {
    try {
        const [resultado] = await conexion.query(
            'SELECT DATABASE() AS base_datos, VERSION() AS version'
        );

        console.log('Conexión exitosa:', resultado[0]);
    } catch (error) {
        console.error('Error de conexión:', error.message);
    } finally {
        await conexion.end();
    }
}

probarConexion();
