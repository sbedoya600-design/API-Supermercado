const readline = require('readline');
const bcrypt = require('bcryptjs');
const conexion = require('./db');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function preguntar(texto) {
    return new Promise((resolve) => {
        rl.question(texto, resolve);
    });
}

async function crearAdministrador() {
    try {
        console.log('\n=== CONFIGURACIÓN INICIAL DE SHOPSOFT ===\n');

        const nombre = (await preguntar('Nombre del administrador: ')).trim();
        const correo = (await preguntar('Correo del administrador: '))
            .trim()
            .toLowerCase();
        const contrasena = await preguntar('Contraseña nueva: ');

        if (!nombre || !correo || contrasena.length < 12) {
            console.log(
                '\nError: completa los datos y utiliza una contraseña de al menos 12 caracteres.'
            );
            return;
        }

        const [usuarios] = await conexion.execute(
            'SELECT COUNT(*) AS total FROM usuarios'
        );

        if (Number(usuarios[0].total) > 0) {
            console.log(
                '\nYa existen usuarios. No se creará otro administrador inicial.'
            );
            return;
        }

        const contrasenaCifrada = await bcrypt.hash(contrasena, 12);

        await conexion.execute(
            `INSERT INTO usuarios (nombre, correo, contrasena, rol)
             VALUES (?, ?, ?, ?)`,
            [nombre, correo, contrasenaCifrada, 'administrador']
        );

        console.log('\n¡Administrador creado correctamente!');
        console.log('Correo registrado:', correo);
        console.log('Rol: administrador');
        console.log('La contraseña se almacenó cifrada.');
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.error('\nEse correo ya está registrado.');
        } else {
            console.error('\nNo se pudo crear el administrador:', error.message);
        }
    } finally {
        rl.close();
        await conexion.end();
    }
}

crearAdministrador();