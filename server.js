const express = require('express');
const cors = require('cors');
const conexion = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Clave secreta para firmar los tokens de autenticación.
// En el siguiente paso la configuraremos mediante variables de entorno.
const JWT_SECRET = process.env.JWT_SECRET;

// ======================================================
// MIDDLEWARE DE AUTENTICACIÓN Y PERMISOS
// ======================================================

function autenticarToken(req, res, next) {
    const encabezado = req.headers.authorization;

    if (!encabezado || !encabezado.startsWith('Bearer ')) {
        return res.status(401).json({
            mensaje: 'Debes iniciar sesión para continuar'
        });
    }

    const token = encabezado.split(' ')[1];

    try {
        req.usuario = jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({
            mensaje: 'Sesión inválida o expirada. Inicia sesión nuevamente'
        });
    }
}

function exigirAdministrador(req, res, next) {
    if (req.usuario.rol !== 'administrador') {
        return res.status(403).json({
            mensaje: 'No tienes permisos para realizar esta acción'
        });
    }

    next();
}

if (!JWT_SECRET) {
    throw new Error(
        'Falta configurar la variable de entorno JWT_SECRET'
    );
}

// ======================================================
// AUTENTICACIÓN - INICIO DE SESIÓN
// ======================================================

app.post('/login', async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        // Validar que se reciban las credenciales.
        if (!correo || !contrasena) {
            return res.status(400).json({
                mensaje: 'El correo y la contraseña son obligatorios'
            });
        }

        // Buscar al usuario en MySQL.
        const [usuariosBD] = await conexion.execute(
            `SELECT id_usuario, nombre, correo, contrasena, rol
             FROM usuarios
             WHERE correo = ?
             LIMIT 1`,
            [correo.trim().toLowerCase()]
        );

        if (usuariosBD.length === 0) {
            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos'
            });
        }

        const usuario = usuariosBD[0];

        // Comparar la contraseña recibida con el hash almacenado.
        const contrasenaValida = await bcrypt.compare(
            contrasena,
            usuario.contrasena
        );

        if (!contrasenaValida) {
            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos'
            });
        }

        // Crear el token de autenticación.
        const token = jwt.sign(
            {
                id: usuario.id_usuario,
                correo: usuario.correo,
                rol: usuario.rol
            },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        // Nunca devolver la contraseña ni su hash.
        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token,
            usuario: {
                id: usuario.id_usuario,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('Error en el inicio de sesión:', error.message);

        res.status(500).json({
            mensaje: 'Error interno al iniciar sesión'
        });
    }
});


// ======================================================
// DATOS TEMPORALES PARA LAS FUNCIONES AUN NO CONECTADAS
// ======================================================

let productos = [];
let usuarios = [
    {
        id: 1,
        nombre: 'Administrador',
        correo: 'admin@shopsoft.com',
        contraseña: '123456',
        rol: 'Administrador'
    }
];

let ventas = [];

// ======================================================
// HU.01 - GESTION DE PRODUCTOS
// ======================================================

 // Consultar categorías desde MySQL
app.get('/categorias', async (req, res) => {
    try {
        const [categorias] = await conexion.query(
            'SELECT id_categoria, nombre FROM categorias ORDER BY nombre'
        );

        res.json(categorias);
    } catch (error) {
        console.error('Error al consultar categorías:', error.message);
        res.status(500).json({
            mensaje: 'Error al consultar las categorías'
        });
    }
});

// Consultar productos desde MySQL
app.get('/productos', async (req, res) => {
    try {
        const [productosBD] = await conexion.query(`
            SELECT
                p.id_producto AS id,
                p.nombre,
                p.id_categoria,
                c.nombre AS categoria,
                p.precio,
                p.cantidad AS stock,
                p.fecha_vencimiento AS fechaVencimiento
            FROM productos p
            LEFT JOIN categorias c
                ON p.id_categoria = c.id_categoria
            ORDER BY p.id_producto
        `);

        res.json(productosBD);
    } catch (error) {
        console.error('Error al consultar productos:', error.message);
        res.status(500).json({
            mensaje: 'Error al consultar los productos'
        });
    }
});

// Consultar producto por ID desde MySQL
app.get('/productos/:id', async (req, res) => {
    try {
        const [resultado] = await conexion.query(
            `SELECT id_producto AS id, nombre, id_categoria,
                    precio, cantidad AS stock,
                    fecha_vencimiento AS fechaVencimiento
             FROM productos
             WHERE id_producto = ?`,
            [req.params.id]
        );

        if (resultado.length === 0) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        res.json(resultado[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            mensaje: 'Error al consultar el producto'
        });
    }
});

// Registrar producto en MySQL
app.post('/productos', async (req, res) => {
    try {
        const {
            nombre,
            id_categoria,
            precio,
            stock,
            fechaVencimiento
        } = req.body;

        if (
            !nombre ||
            !id_categoria ||
            precio === undefined ||
            stock === undefined
        ) {
            return res.status(400).json({
                mensaje: 'Nombre, categoría, precio y cantidad son obligatorios'
            });
        }

        const [resultado] = await conexion.query(
            `INSERT INTO productos
                (nombre, id_categoria, precio, cantidad, fecha_vencimiento)
             VALUES (?, ?, ?, ?, ?)`,
            [
                nombre,
                id_categoria,
                precio,
                stock,
                fechaVencimiento || null
            ]
        );

        res.status(201).json({
            mensaje: 'Producto registrado correctamente',
            id: resultado.insertId
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            mensaje: 'Error al registrar el producto'
        });
    }
});

// Actualizar producto en MySQL
app.put('/productos/:id', async (req, res) => {
    try {
        const {
            nombre,
            id_categoria,
            precio,
            stock,
            fechaVencimiento
        } = req.body;

        const [resultado] = await conexion.query(
            `UPDATE productos
             SET nombre = ?,
                 id_categoria = ?,
                 precio = ?,
                 cantidad = ?,
                 fecha_vencimiento = ?
             WHERE id_producto = ?`,
            [
                nombre,
                id_categoria,
                precio,
                stock,
                fechaVencimiento || null,
                req.params.id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado o sin cambios'
            });
        }

        res.json({
            mensaje: 'Producto actualizado correctamente'
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            mensaje: 'Error al actualizar el producto'
        });
    }
});

// Eliminar producto de MySQL
app.delete('/productos/:id', async (req, res) => {
    try {
        const [resultado] = await conexion.query(
            'DELETE FROM productos WHERE id_producto = ?',
            [req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        res.json({
            mensaje: 'Producto eliminado correctamente'
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            mensaje: 'No se pudo eliminar el producto. Puede tener movimientos asociados.'
        });
    }
});

// ======================================================
// HU.02 - ALERTAS DE VENCIMIENTO
// ======================================================

app.get('/alertas/vencimiento', async (req, res) => {
    try {
        const [productosPorVencer] = await conexion.query(`
            SELECT id_producto AS id, nombre, cantidad AS stock,
                   fecha_vencimiento AS fechaVencimiento
            FROM productos
            WHERE cantidad > 0
              AND fecha_vencimiento BETWEEN CURDATE()
              AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            ORDER BY fecha_vencimiento
        `);

        res.json({
            mensaje: 'Productos próximos a vencer',
            cantidad: productosPorVencer.length,
            productos: productosPorVencer
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            mensaje: 'Error al consultar las alertas'
        });
    }
});

// ======================================================
// HU.03 - VENTAS
// Esta ruta sigue usando datos temporales por ahora.
// ======================================================

app.post('/ventas', (req, res) => {
    const { productoId, cantidad } = req.body;
    const producto = productos.find(
        p => p.id === parseInt(productoId)
    );

    if (!producto) {
        return res.status(404).json({
            mensaje: 'Producto no encontrado en los datos temporales'
        });
    }

    if (!cantidad || cantidad <= 0) {
        return res.status(400).json({
            mensaje: 'La cantidad debe ser mayor que cero'
        });
    }

    if (cantidad > producto.stock) {
        return res.status(400).json({
            mensaje: 'Stock insuficiente'
        });
    }

    producto.stock -= cantidad;

    const venta = {
        id: ventas.length + 1,
        productoId: producto.id,
        producto: producto.nombre,
        cantidad,
        precioUnitario: producto.precio,
        total: producto.precio * cantidad,
        fecha: new Date().toISOString()
    };

    ventas.push(venta);

    res.status(201).json({
        mensaje: 'Venta temporal realizada',
        venta,
        stockActual: producto.stock
    });
});

app.get('/ventas', (req, res) => {
    res.json(ventas);
});

// ======================================================
// HU.04 - REPORTES
// ======================================================

app.get('/reportes/inventario', async (req, res) => {
    try {
        const { categoria } = req.query;

        let consulta = `
            SELECT p.id_producto AS id, p.nombre,
                   c.nombre AS categoria, p.precio,
                   p.cantidad AS stock,
                   p.fecha_vencimiento AS fechaVencimiento
            FROM productos p
            LEFT JOIN categorias c
                ON p.id_categoria = c.id_categoria
        `;

        const parametros = [];

        if (categoria) {
            consulta += ' WHERE c.nombre = ?';
            parametros.push(categoria);
        }

        consulta += ' ORDER BY p.nombre';

        const [resultado] = await conexion.query(
            consulta,
            parametros
        );

        res.json({
            tipo: 'Reporte de inventario',
            totalProductos: resultado.length,
            productos: resultado
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            mensaje: 'Error al generar el reporte de inventario'
        });
    }
});

app.get('/reportes/ventas', (req, res) => {
    const totalVentas = ventas.reduce(
        (total, venta) => total + venta.total,
        0
    );

    res.json({
        tipo: 'Reporte temporal de ventas',
        cantidadVentas: ventas.length,
        totalVendido: totalVentas,
        ventas
    });
});

// ======================================================
// HU.05 - GESTIÓN DE USUARIOS CON MYSQL
// ======================================================

// CONSULTAR TODOS LOS USUARIOS
// Solo el administrador puede consultar la lista completa.
app.get(
    '/usuarios',
    autenticarToken,
    exigirAdministrador,
    async (req, res) => {
        try {
            const [usuariosBD] = await conexion.query(`
                SELECT id_usuario, nombre, correo, rol
                FROM usuarios
                ORDER BY id_usuario DESC
            `);

            res.json(usuariosBD);
        } catch (error) {
            console.error('Error al consultar usuarios:', error.message);

            res.status(500).json({
                mensaje: 'Error al consultar los usuarios'
            });
        }
    }
);


// CONSULTAR UN USUARIO POR ID
app.get(
    '/usuarios/:id',
    autenticarToken,
    exigirAdministrador,
    async (req, res) => {
        try {
            const [usuariosBD] = await conexion.execute(
                `SELECT id_usuario, nombre, correo, rol
                 FROM usuarios
                 WHERE id_usuario = ?`,
                [req.params.id]
            );

            if (usuariosBD.length === 0) {
                return res.status(404).json({
                    mensaje: 'Usuario no encontrado'
                });
            }

            res.json(usuariosBD[0]);
        } catch (error) {
            console.error('Error al consultar usuario:', error.message);

            res.status(500).json({
                mensaje: 'Error al consultar el usuario'
            });
        }
    }
);


// REGISTRAR UN NUEVO USUARIO
app.post(
    '/usuarios',
    autenticarToken,
    exigirAdministrador,
    async (req, res) => {
        try {
            console.log('DATOS RECIBIDOS EN /usuarios:', req.body);

            const nombre = req.body.nombre?.trim();
            const correo = req.body.correo?.trim().toLowerCase();

            // Admite ambos nombres de campo para facilitar
            // la compatibilidad con formularios existentes.
            const contrasena =
                req.body.contrasena ?? req.body.contraseña;

            const rol = req.body.rol?.trim().toLowerCase();

            if (!nombre || !correo || !contrasena || !rol) {
                return res.status(400).json({
                    mensaje: 'Todos los campos son obligatorios'
                });
            }

            if (String(contrasena).length < 8) {
                return res.status(400).json({
                    mensaje: 'La contraseña debe tener al menos 8 caracteres'
                });
            }

            if (!['administrador', 'empleado'].includes(rol)) {
                return res.status(400).json({
                    mensaje: 'El rol debe ser administrador o empleado'
                });
            }

            const [existentes] = await conexion.execute(
                'SELECT id_usuario FROM usuarios WHERE correo = ?',
                [correo]
            );

            if (existentes.length > 0) {
                return res.status(409).json({
                    mensaje: 'Ese correo ya está registrado'
                });
            }

            const contrasenaCifrada = await bcrypt.hash(
                String(contrasena),
                10
            );

            const [resultado] = await conexion.execute(
                `INSERT INTO usuarios
                    (nombre, correo, contrasena, rol)
                 VALUES (?, ?, ?, ?)`,
                [nombre, correo, contrasenaCifrada, rol]
            );

            res.status(201).json({
                mensaje: 'Usuario registrado correctamente',
                usuario: {
                    id_usuario: resultado.insertId,
                    nombre,
                    correo,
                    rol
                }
            });
        } catch (error) {
            console.error('Error al registrar usuario:', error.message);

            res.status(500).json({
                mensaje: 'Error al registrar el usuario'
            });
        }
    }
);


// EDITAR UN USUARIO
// La contraseña es opcional al editar.
app.put(
    '/usuarios/:id',
    autenticarToken,
    exigirAdministrador,
    async (req, res) => {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({
                    mensaje: 'El ID del usuario no es válido'
                });
            }

            const [usuariosBD] = await conexion.execute(
                `SELECT id_usuario, nombre, correo, rol
                 FROM usuarios
                 WHERE id_usuario = ?`,
                [id]
            );

            if (usuariosBD.length === 0) {
                return res.status(404).json({
                    mensaje: 'Usuario no encontrado'
                });
            }

            const actual = usuariosBD[0];

            const nombre = req.body.nombre === undefined
                ? actual.nombre
                : req.body.nombre.trim();

            const correo = req.body.correo === undefined
                ? actual.correo
                : req.body.correo.trim().toLowerCase();

            const rol = req.body.rol === undefined
                ? actual.rol
                : req.body.rol.trim().toLowerCase();

            const contrasena =
                req.body.contrasena ?? req.body.contraseña;

            if (!nombre || !correo) {
                return res.status(400).json({
                    mensaje: 'El nombre y el correo son obligatorios'
                });
            }

            if (!['administrador', 'empleado'].includes(rol)) {
                return res.status(400).json({
                    mensaje: 'El rol debe ser administrador o empleado'
                });
            }

            // Evitar que dos usuarios compartan el mismo correo.
            const [correoDuplicado] = await conexion.execute(
                `SELECT id_usuario
                 FROM usuarios
                 WHERE correo = ? AND id_usuario <> ?`,
                [correo, id]
            );

            if (correoDuplicado.length > 0) {
                return res.status(409).json({
                    mensaje: 'Ese correo ya está registrado por otro usuario'
                });
            }

            if (
                contrasena !== undefined &&
                String(contrasena).length < 8
            ) {
                return res.status(400).json({
                    mensaje: 'La contraseña debe tener al menos 8 caracteres'
                });
            }

            if (contrasena) {
                const contrasenaCifrada = await bcrypt.hash(
                    String(contrasena),
                    10
                );

                await conexion.execute(
                    `UPDATE usuarios
                     SET nombre = ?, correo = ?, rol = ?, contrasena = ?
                     WHERE id_usuario = ?`,
                    [nombre, correo, rol, contrasenaCifrada, id]
                );
            } else {
                await conexion.execute(
                    `UPDATE usuarios
                     SET nombre = ?, correo = ?, rol = ?
                     WHERE id_usuario = ?`,
                    [nombre, correo, rol, id]
                );
            }

            res.json({
                mensaje: 'Usuario actualizado correctamente',
                usuario: {
                    id_usuario: id,
                    nombre,
                    correo,
                    rol
                }
            });
        } catch (error) {
            console.error('Error al actualizar usuario:', error.message);

            res.status(500).json({
                mensaje: 'Error al actualizar el usuario'
            });
        }
    }
);


// ELIMINAR UN USUARIO
app.delete(
    '/usuarios/:id',
    autenticarToken,
    exigirAdministrador,
    async (req, res) => {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({
                    mensaje: 'El ID del usuario no es válido'
                });
            }

            // No permitir que el administrador elimine su propia cuenta.
            if (Number(req.usuario.id) === id) {
                return res.status(400).json({
                    mensaje: 'No puedes eliminar tu propia cuenta'
                });
            }

            const [resultado] = await conexion.execute(
                'DELETE FROM usuarios WHERE id_usuario = ?',
                [id]
            );

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: 'Usuario no encontrado'
                });
            }

            res.json({
                mensaje: 'Usuario eliminado correctamente'
            });
        } catch (error) {
            console.error('Error al eliminar usuario:', error.message);

            res.status(500).json({
                mensaje: 'No se pudo eliminar el usuario. Puede tener ventas asociadas.'
            });
        }
    }
);

// ======================================================
// INICIO DEL SERVIDOR
// ======================================================

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
