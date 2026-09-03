const express = require('express');

const app = express();

const PORT = 3000;

// Permitir recibir datos en formato JSON
app.use(express.json());

// ================================
// DATOS DE PRODUCTOS
// ================================

const productos = [
    {
        id: 1,
        nombre: 'Arroz',
        precio: 4500,
        stock: 20
    },
    {
        id: 2,
        nombre: 'Leche',
        precio: 3800,
        stock: 15
    },
    {
        id: 3,
        nombre: 'Galletas',
        precio: 2500,
        stock: 30
    }
];

// ================================
// GET - Obtener todos los productos
// ================================

app.get('/productos', (req, res) => {
    res.json(productos);
});

// ================================
// GET - Obtener un producto por ID
// ================================

app.get('/productos/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const producto = productos.find(producto => producto.id === id);

    if (!producto) {
        return res.status(404).json({
            mensaje: 'Producto no encontrado'
        });
    }

    res.json(producto);
});

// ================================
// POST - Crear un producto
// ================================

app.post('/productos', (req, res) => {
    const nuevoProducto = {
        id: productos.length + 1,
        nombre: req.body.nombre,
        precio: req.body.precio,
        stock: req.body.stock
    };

    productos.push(nuevoProducto);

    res.status(201).json(nuevoProducto);
});

// ================================
// PUT - Actualizar un producto
// ================================

app.put('/productos/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const producto = productos.find(producto => producto.id === id);

    if (!producto) {
        return res.status(404).json({
            mensaje: 'Producto no encontrado'
        });
    }

    producto.nombre = req.body.nombre;
    producto.precio = req.body.precio;
    producto.stock = req.body.stock;

    res.json(producto);
});

// ================================
// DELETE - Eliminar un producto
// ================================

app.delete('/productos/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const indice = productos.findIndex(producto => producto.id === id);

    if (indice === -1) {
        return res.status(404).json({
            mensaje: 'Producto no encontrado'
        });
    }

    const productoEliminado = productos.splice(indice, 1);

    res.json({
        mensaje: 'Producto eliminado correctamente',
        producto: productoEliminado[0]
    });
});

// ================================
// INICIAR SERVIDOR
// ================================

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});