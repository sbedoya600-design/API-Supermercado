# DOCUMENTACIÓN DE LA API REST - SHOPSOFT

## 1. Información general

**Proyecto:** ShopSoft - Sistema de gestión para supermercado  
**Evidencia:** GA7-220501096-AA5-EV03 - Diseño y desarrollo de servicios web  
**Tecnologías:** Node.js, Express, JavaScript, Git, GitHub y Postman.

## 2. Objetivo

Desarrollar una API REST que permita gestionar los productos de un supermercado mediante servicios web. La API permite consultar, registrar, actualizar y eliminar productos utilizando solicitudes HTTP y datos en formato JSON.

## 3. Descripción de la API

La API fue desarrollada utilizando Node.js y el framework Express.

Durante el desarrollo se implementaron servicios REST para realizar operaciones CRUD sobre los productos:

- **Create:** crear productos.
- **Read:** consultar productos.
- **Update:** actualizar productos.
- **Delete:** eliminar productos.

La API se ejecuta localmente mediante:

```text
http://localhost:3000
```

## 4. Estructura de los datos

Cada producto contiene los siguientes atributos:

| Campo | Tipo | Descripción |
|---|---|---|
| id | Number | Identificador único del producto |
| nombre | String | Nombre del producto |
| precio | Number | Precio del producto |
| stock | Number | Cantidad disponible |

Ejemplo:

```json
{
    "id": 1,
    "nombre": "Arroz",
    "precio": 4500,
    "stock": 20
}
```

---

# 5. Servicios implementados

## 5.1 GET /productos

### Descripción

Obtiene la lista de todos los productos registrados en el sistema.

### Método HTTP

```text
GET
```

### URL

```text
http://localhost:3000/productos
```

### Solicitud

No requiere cuerpo ni parámetros.

### Respuesta exitosa

**Código HTTP:** `200 OK`

Ejemplo:

```json
[
    {
        "id": 1,
        "nombre": "Arroz",
        "precio": 4500,
        "stock": 20
    },
    {
        "id": 2,
        "nombre": "Leche",
        "precio": 3800,
        "stock": 15
    },
    {
        "id": 3,
        "nombre": "Galletas",
        "precio": 2500,
        "stock": 30
    }
]
```

---

## 5.2 GET /productos/:id

### Descripción

Permite consultar un producto específico utilizando su identificador.

### Método HTTP

```text
GET
```

### URL

```text
http://localhost:3000/productos/1
```

### Parámetro

| Parámetro | Tipo | Descripción |
|---|---|---|
| id | Number | Identificador del producto |

### Respuesta exitosa

**Código HTTP:** `200 OK`

Ejemplo:

```json
{
    "id": 1,
    "nombre": "Arroz",
    "precio": 4500,
    "stock": 20
}
```

### Producto no encontrado

**Código HTTP:** `404 Not Found`

Ejemplo:

```json
{
    "mensaje": "Producto no encontrado"
}
```

---

## 5.3 POST /productos

### Descripción

Permite registrar un nuevo producto en el sistema.

### Método HTTP

```text
POST
```

### URL

```text
http://localhost:3000/productos
```

### Tipo de contenido

```text
Content-Type: application/json
```

### Cuerpo de la solicitud

```json
{
    "nombre": "Café",
    "precio": 8000,
    "stock": 10
}
```

### Respuesta exitosa

**Código HTTP:** `201 Created`

Ejemplo:

```json
{
    "id": 4,
    "nombre": "Café",
    "precio": 8000,
    "stock": 10
}
```

---

## 5.4 PUT /productos/:id

### Descripción

Permite actualizar la información de un producto existente.

### Método HTTP

```text
PUT
```

### URL

```text
http://localhost:3000/productos/1
```

### Parámetro

| Parámetro | Tipo | Descripción |
|---|---|---|
| id | Number | Identificador del producto que se desea actualizar |

### Tipo de contenido

```text
Content-Type: application/json
```

### Cuerpo de la solicitud

```json
{
    "nombre": "Arroz Premium",
    "precio": 5000,
    "stock": 25
}
```

### Respuesta exitosa

**Código HTTP:** `200 OK`

Ejemplo:

```json
{
    "id": 1,
    "nombre": "Arroz Premium",
    "precio": 5000,
    "stock": 25
}
```

### Producto no encontrado

**Código HTTP:** `404 Not Found`

```json
{
    "mensaje": "Producto no encontrado"
}
```

---

## 5.5 DELETE /productos/:id

### Descripción

Permite eliminar un producto existente mediante su identificador.

### Método HTTP

```text
DELETE
```

### URL

```text
http://localhost:3000/productos/1
```

### Parámetro

| Parámetro | Tipo | Descripción |
|---|---|---|
| id | Number | Identificador del producto que se desea eliminar |

### Respuesta exitosa

**Código HTTP:** `200 OK`

Ejemplo:

```json
{
    "mensaje": "Producto eliminado correctamente",
    "producto": {
        "id": 1,
        "nombre": "Arroz",
        "precio": 4500,
        "stock": 20
    }
}
```

### Producto no encontrado

**Código HTTP:** `404 Not Found`

```json
{
    "mensaje": "Producto no encontrado"
}
```

---

# 6. Resumen de servicios

| Método | Endpoint | Función | Respuesta |
|---|---|---|---|
| GET | `/productos` | Consultar todos los productos | 200 |
| GET | `/productos/:id` | Consultar un producto | 200 / 404 |
| POST | `/productos` | Crear un producto | 201 |
| PUT | `/productos/:id` | Actualizar un producto | 200 / 404 |
| DELETE | `/productos/:id` | Eliminar un producto | 200 / 404 |

---

# 7. Pruebas de funcionamiento

Los servicios fueron probados utilizando Postman.

Se realizaron pruebas de:

- Consulta de todos los productos mediante GET.
- Consulta de un producto mediante GET con identificador.
- Registro de un producto mediante POST.
- Actualización de un producto mediante PUT.
- Eliminación de un producto mediante DELETE.

Las solicitudes fueron ejecutadas sobre el servidor local:

```text
http://localhost:3000
```

Las pruebas permitieron verificar que los servicios respondieran correctamente mediante códigos de estado HTTP y datos en formato JSON.

---

# 8. Control de versiones

Para el control de versiones del proyecto se utilizó Git.

El código fuente fue almacenado en un repositorio público de GitHub:

**Repositorio:** API-Supermercado

El proyecto cuenta con un historial de commits que permite realizar seguimiento a los cambios efectuados durante el desarrollo.

---

# 9. Ejecución del proyecto

Para ejecutar el proyecto se deben instalar las dependencias mediante:

```bash
npm install
```

Posteriormente se inicia el servidor mediante:

```bash
node server.js
```

Cuando el servidor se inicia correctamente se muestra:

```text
Servidor ejecutándose en http://localhost:3000
```

La API puede ser probada utilizando Postman.

---

# 10. Conclusión

Se desarrolló una API REST funcional para el proyecto ShopSoft, implementando servicios web para la gestión de productos de un supermercado.

La API permite realizar las principales operaciones CRUD mediante los métodos HTTP GET, POST, PUT y DELETE. Además, se realizaron pruebas mediante Postman y se utilizó Git y GitHub para el control y almacenamiento del código fuente.