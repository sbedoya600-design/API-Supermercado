# DOCUMENTACIÓN DE API REST - SHOPSOFT

## 1. Información general

**Proyecto:** ShopSoft - Sistema de gestión para supermercado  
**Evidencia:** GA7-220501096-AA5-EV03 - Diseño y desarrollo de servicios web - proyecto  
**Programa:** Análisis y Desarrollo de Software  
**Tecnologías:** Node.js, Express, JavaScript, Git, GitHub y Postman.

---

## 2. Introducción

ShopSoft es un sistema orientado a la gestión de las operaciones principales de un supermercado. De acuerdo con las historias de usuario definidas para el proyecto, el sistema contempla la gestión de productos, control de inventario, alertas de productos próximos a vencer, registro de ventas, generación de reportes y gestión de usuarios.

Para proporcionar estas funcionalidades se desarrolló una API REST utilizando Node.js y Express.

---

## 3. Objetivo

Diseñar y desarrollar servicios web para el proyecto ShopSoft que permitan disponer de métodos reutilizables para gestionar las principales funcionalidades del sistema mediante solicitudes HTTP y datos en formato JSON.

---

## 4. Tecnologías utilizadas

- Node.js
- Express
- JavaScript
- Git
- GitHub
- Postman

---

# 5. Servicios de la API

La API se ejecuta localmente mediante:

```text
http://localhost:3000
```

Los servicios implementados se organizan de acuerdo con las funcionalidades principales del proyecto.

---

# 6. Gestión de productos

## 6.1 Consultar todos los productos

**Método:** GET

**Endpoint:**

```text
GET http://localhost:3000/productos
```

**Descripción:**

Permite consultar todos los productos registrados en el sistema.

**Respuesta:**

```json
[
    {
        "id": 1,
        "nombre": "Arroz",
        "lote": "L001",
        "fechaVencimiento": "2026-09-10",
        "categoria": "Granos",
        "precio": 4500,
        "stock": 20
    }
]
```

**Código de respuesta:** `200 OK`

---

## 6.2 Consultar producto por identificador

**Método:** GET

**Endpoint:**

```text
GET http://localhost:3000/productos/:id
```

**Ejemplo:**

```text
GET http://localhost:3000/productos/1
```

**Descripción:**

Permite consultar un producto específico utilizando su identificador.

**Respuesta exitosa:**

```json
{
    "id": 1,
    "nombre": "Arroz",
    "lote": "L001",
    "fechaVencimiento": "2026-09-10",
    "categoria": "Granos",
    "precio": 4500,
    "stock": 20
}
```

**Código:** `200 OK`

Si el producto no existe:

```json
{
    "mensaje": "Producto no encontrado"
}
```

**Código:** `404 Not Found`

---

## 6.3 Registrar producto

**Método:** POST

**Endpoint:**

```text
POST http://localhost:3000/productos
```

**Descripción:**

Permite registrar un nuevo producto en el inventario.

**Cuerpo de la solicitud:**

```json
{
    "nombre": "Café",
    "lote": "L004",
    "fechaVencimiento": "2026-12-15",
    "categoria": "Bebidas",
    "precio": 8000,
    "stock": 10
}
```

**Respuesta exitosa:**

```json
{
    "mensaje": "Producto registrado",
    "producto": {
        "id": 4,
        "nombre": "Café",
        "lote": "L004",
        "fechaVencimiento": "2026-12-15",
        "categoria": "Bebidas",
        "precio": 8000,
        "stock": 10
    }
}
```

**Código:** `201 Created`

---

## 6.4 Actualizar producto

**Método:** PUT

**Endpoint:**

```text
PUT http://localhost:3000/productos/:id
```

**Ejemplo:**

```text
PUT http://localhost:3000/productos/1
```

**Cuerpo de la solicitud:**

```json
{
    "nombre": "Arroz Premium",
    "lote": "L001",
    "fechaVencimiento": "2026-09-15",
    "categoria": "Granos",
    "precio": 5000,
    "stock": 25
}
```

**Descripción:**

Permite actualizar la información de un producto existente.

**Código:** `200 OK`

Si el producto no existe:

```json
{
    "mensaje": "Producto no encontrado"
}
```

**Código:** `404 Not Found`

---

## 6.5 Eliminar producto

**Método:** DELETE

**Endpoint:**

```text
DELETE http://localhost:3000/productos/:id
```

**Ejemplo:**

```text
DELETE http://localhost:3000/productos/1
```

**Descripción:**

Permite eliminar un producto existente del sistema.

**Respuesta:**

```json
{
    "mensaje": "Producto eliminado correctamente",
    "producto": {
        "id": 1,
        "nombre": "Arroz"
    }
}
```

**Código:** `200 OK`

---

# 7. Alertas de productos próximos a vencer

## 7.1 Consultar productos próximos a vencer

**Método:** GET

**Endpoint:**

```text
GET http://localhost:3000/alertas/vencimiento
```

**Descripción:**

Consulta los productos que se encuentran próximos a su fecha de vencimiento.

El servicio considera productos con stock disponible y cuya fecha de vencimiento se encuentre dentro de los próximos siete días.

**Respuesta:**

```json
{
    "mensaje": "Productos próximos a vencer",
    "cantidad": 1,
    "productos": [
        {
            "id": 2,
            "nombre": "Leche",
            "lote": "L002",
            "fechaVencimiento": "2026-09-06",
            "categoria": "Lácteos",
            "precio": 3800,
            "stock": 15
        }
    ]
}
```

**Código:** `200 OK`

---

# 8. Ventas e inventario

## 8.1 Registrar una venta

**Método:** POST

**Endpoint:**

```text
POST http://localhost:3000/ventas
```

**Descripción:**

Permite registrar la venta de un producto y actualizar automáticamente el stock disponible.

**Cuerpo de la solicitud:**

```json
{
    "productoId": 2,
    "cantidad": 3
}
```

**Funcionamiento:**

1. Se verifica que el producto exista.
2. Se verifica que la cantidad sea válida.
3. Se verifica que exista stock suficiente.
4. Se descuenta la cantidad vendida del inventario.
5. Se registra la venta.
6. Se calcula el valor total.

**Respuesta exitosa:**

```json
{
    "mensaje": "Venta realizada",
    "venta": {
        "id": 1,
        "productoId": 2,
        "producto": "Leche",
        "cantidad": 3,
        "precioUnitario": 3800,
        "total": 11400
    },
    "stockActual": 12
}
```

**Código:** `201 Created`

Si no existe suficiente inventario:

```json
{
    "mensaje": "Stock insuficiente"
}
```

**Código:** `400 Bad Request`

---

## 8.2 Consultar ventas

**Método:** GET

**Endpoint:**

```text
GET http://localhost:3000/ventas
```

**Descripción:**

Permite consultar las ventas registradas en el sistema.

**Código:** `200 OK`

---

# 9. Reportes

## 9.1 Reporte de inventario

**Método:** GET

**Endpoint:**

```text
GET http://localhost:3000/reportes/inventario
```

**Descripción:**

Permite consultar información del inventario.

También permite filtrar los productos mediante la categoría.

**Ejemplo:**

```text
GET http://localhost:3000/reportes/inventario?categoria=Granos
```

**Respuesta:**

```json
{
    "tipo": "Reporte de inventario",
    "totalProductos": 1,
    "productos": [
        {
            "id": 1,
            "nombre": "Arroz",
            "categoria": "Granos",
            "precio": 4500,
            "stock": 20
        }
    ]
}
```

**Código:** `200 OK`

---

## 9.2 Reporte de ventas

**Método:** GET

**Endpoint:**

```text
GET http://localhost:3000/reportes/ventas
```

**Descripción:**

Genera información resumida de las ventas registradas y calcula el valor total vendido.

**Respuesta:**

```json
{
    "tipo": "Reporte de ventas",
    "cantidadVentas": 1,
    "totalVendido": 11400,
    "ventas": []
}
```

**Código:** `200 OK`

---

# 10. Gestión de usuarios

## 10.1 Consultar usuarios

**Método:** GET

**Endpoint:**

```text
GET http://localhost:3000/usuarios
```

**Descripción:**

Permite consultar los usuarios registrados en el sistema.

**Código:** `200 OK`

---

## 10.2 Crear usuario

**Método:** POST

**Endpoint:**

```text
POST http://localhost:3000/usuarios
```

**Descripción:**

Permite crear usuarios para el sistema y asignarles un rol.

Los roles disponibles son:

- Empleado
- Gerente

**Cuerpo de la solicitud:**

```json
{
    "nombre": "Juan Pérez",
    "correo": "juan@shopsoft.com",
    "contraseña": "123456",
    "rol": "Empleado"
}
```

**Respuesta exitosa:**

```json
{
    "mensaje": "Usuario creado",
    "usuario": {
        "id": 2,
        "nombre": "Juan Pérez",
        "correo": "juan@shopsoft.com",
        "rol": "Empleado"
    }
}
```

**Código:** `201 Created`

Si el correo ya está registrado:

```json
{
    "mensaje": "Correo ya registrado"
}
```

**Código:** `400 Bad Request`

---

# 11. Resumen de endpoints

| Método | Endpoint | Funcionalidad |
|---|---|---|
| GET | `/productos` | Consultar productos |
| GET | `/productos/:id` | Consultar producto |
| POST | `/productos` | Registrar producto |
| PUT | `/productos/:id` | Actualizar producto |
| DELETE | `/productos/:id` | Eliminar producto |
| GET | `/alertas/vencimiento` | Consultar productos próximos a vencer |
| POST | `/ventas` | Registrar venta y actualizar inventario |
| GET | `/ventas` | Consultar ventas |
| GET | `/reportes/inventario` | Consultar reporte de inventario |
| GET | `/reportes/ventas` | Consultar reporte de ventas |
| GET | `/usuarios` | Consultar usuarios |
| POST | `/usuarios` | Crear usuario |

---

# 12. Control de versiones

El proyecto utiliza Git como herramienta de control de versiones y GitHub como repositorio remoto.

El repositorio utilizado para almacenar el proyecto es:

```text
https://github.com/sbedoya600-design/API-Supermercado
```

El código fuente cuenta con diferentes commits que permiten realizar seguimiento a los cambios realizados durante el desarrollo.

---

# 13. Ejecución

Para instalar las dependencias del proyecto:

```bash
npm install
```

Para iniciar el servidor:

```bash
node server.js
```

Al iniciar correctamente se muestra:

```text
Servidor ejecutándose en http://localhost:3000
```

---

# 14. Consideraciones

La versión desarrollada utiliza estructuras de datos en memoria para representar los productos, usuarios y ventas. Por esta razón, la información se reinicia cuando se detiene el servidor.

La API fue desarrollada como parte del proceso académico del proyecto ShopSoft y permite demostrar la implementación de servicios web REST relacionados con las funcionalidades definidas en las historias de usuario.

---

# 15. Conclusión

Se diseñaron y desarrollaron servicios web REST para el proyecto ShopSoft utilizando Node.js y Express.

Los servicios permiten gestionar productos, consultar alertas de vencimiento, registrar ventas con actualización de inventario, consultar reportes y administrar usuarios.

El proyecto fue gestionado mediante Git y almacenado en un repositorio remoto de GitHub, cumpliendo con el uso de herramientas de versionamiento solicitado para la evidencia GA7-220501096-AA5-EV03.