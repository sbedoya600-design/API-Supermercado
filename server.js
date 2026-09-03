const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

// ======================================================
// DATOS DEL SISTEMA
// ======================================================

let productos = [
    {
        id: 1,
        nombre: 'Arroz',
        lote: 'L001',
        fechaVencimiento: '2026-09-10',
        categoria: 'Granos',
        precio: 4500,
        stock: 20
    },
    {
        id: 2,
        nombre: 'Leche',
        lote: 'L002',
        fechaVencimiento: '2026-09-06',
        categoria: 'Lácteos',
        precio: 3800,
        stock: 15
    },
    {
        id: 3,
        nombre: 'Galletas',
        lote: 'L003',
        fechaVencimiento: '2026-12-20',
        categoria: 'Snacks',
        precio: 2500,
        stock: 30
    }
];

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
// HU.01 - GESTIÓN DE PRODUCTOS
// ======================================================

// Consultar todos los productos
app.get('/productos', (req, res) => {
    res.json(productos);
});

// Consultar producto por ID
app.get('/productos/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const producto = productos.find(p => p.id === id);

    if (!producto) {
        return res.status(404).json({
            mensaje: 'Producto no encontrado'
        });
    }

    res.json(producto);
});

// Registrar producto
app.post('/productos', (req, res) => {

    const { nombre, lote, fechaVencimiento, categoria, precio, stock } = req.body;

    if (!nombre || !lote || !fechaVencimiento || !categoria || precio === undefined || stock === undefined) {
        return res.status(400).json({
            mensaje: 'Todos los campos son obligatorios'
        });
    }

    const nuevoProducto = {
        id: productos.length + 1,
        nombre,
        lote,
        fechaVencimiento,
        categoria,
        precio,
        stock
    };

    productos.push(nuevoProducto);

    res.status(201).json({
        mensaje: 'Producto registrado',
        producto: nuevoProducto
    });
});

// Actualizar producto
app.put('/productos/:id', (req, res) => {

    const id = parseInt(req.params.id);

    const producto = productos.find(p => p.id === id);

    if (!producto) {
        return res.status(404).json({
            mensaje: 'Producto no encontrado'
        });
    }

    producto.nombre = req.body.nombre ?? producto.nombre;
    producto.lote = req.body.lote ?? producto.lote;
    producto.fechaVencimiento = req.body.fechaVencimiento ?? producto.fechaVencimiento;
    producto.categoria = req.body.categoria ?? producto.categoria;
    producto.precio = req.body.precio ?? producto.precio;
    producto.stock = req.body.stock ?? producto.stock;

    res.json({
        mensaje: 'Producto actualizado',
        producto
    });
});

// Eliminar producto
app.delete('/productos/:id', (req, res) => {

    const id = parseInt(req.params.id);

    const indice = productos.findIndex(p => p.id === id);

    if (indice === -1) {
        return res.status(404).json({
            mensaje: 'Producto no encontrado'
        });
    }

    const eliminado = productos.splice(indice, 1);

    res.json({
        mensaje: 'Producto eliminado correctamente',
        producto: eliminado[0]
    });
});

// ======================================================
// HU.02 - ALERTAS DE PRODUCTOS PRÓXIMOS A VENCER
// ======================================================

app.get('/alertas/vencimiento', (req, res) => {

    const hoy = new Date();

    const alertas = productos.filter(producto => {

        if (producto.stock <= 0) {
            return false;
        }

        const fechaVencimiento = new Date(producto.fechaVencimiento);

        const diferencia = fechaVencimiento - hoy;

        const dias = diferencia / (1000 * 60 * 60 * 24);

        return dias >= 0 && dias <= 7;
    });

    res.json({
        mensaje: 'Productos próximos a vencer',
        cantidad: alertas.length,
        productos: alertas
    });
});

// ======================================================
// HU.03 - VENTAS Y ACTUALIZACIÓN DE INVENTARIO
// ======================================================

app.post('/ventas', (req, res) => {

    const { productoId, cantidad } = req.body;

    const producto = productos.find(p => p.id === parseInt(productoId));

    if (!producto) {
        return res.status(404).json({
            mensaje: 'Producto no encontrado'
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
        mensaje: 'Venta realizada',
        venta,
        stockActual: producto.stock
    });
});

// Consultar ventas
app.get('/ventas', (req, res) => {
    res.json(ventas);
});

// ======================================================
// HU.04 - REPORTES
// ======================================================

// Reporte de inventario
app.get('/reportes/inventario', (req, res) => {

    const { categoria } = req.query;

    let resultado = productos;

    if (categoria) {
        resultado = productos.filter(
            p => p.categoria.toLowerCase() === categoria.toLowerCase()
        );
    }

    res.json({
        tipo: 'Reporte de inventario',
        totalProductos: resultado.length,
        productos: resultado
    });
});

// Reporte de ventas
app.get('/reportes/ventas', (req, res) => {

    const totalVentas = ventas.reduce(
        (total, venta) => total + venta.total,
        0
    );

    res.json({
        tipo: 'Reporte de ventas',
        cantidadVentas: ventas.length,
        totalVendido: totalVentas,
        ventas
    });
});

// ======================================================
// HU.05 - USUARIOS
// ======================================================

// Consultar usuarios
app.get('/usuarios', (req, res) => {
    res.json(usuarios);
});

// Crear usuario
app.post('/usuarios', (req, res) => {

    const { nombre, correo, contraseña, rol } = req.body;

    if (!nombre || !correo || !contraseña || !rol) {
        return res.status(400).json({
            mensaje: 'Todos los campos son obligatorios'
        });
    }

    const existe = usuarios.find(u => u.correo === correo);

    if (existe) {
        return res.status(400).json({
            mensaje: 'Correo ya registrado'
        });
    }

    if (rol !== 'Empleado' && rol !== 'Gerente') {
        return res.status(400).json({
            mensaje: 'El rol debe ser Empleado o Gerente'
        });
    }

    const nuevoUsuario = {
        id: usuarios.length + 1,
        nombre,
        correo,
        contraseña,
        rol
    };

    usuarios.push(nuevoUsuario);

    res.status(201).json({
        mensaje: 'Usuario creado',
        usuario: nuevoUsuario
    });
});

// ======================================================
// INICIO DEL SERVIDOR
// ======================================================

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});