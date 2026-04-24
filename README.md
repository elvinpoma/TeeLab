
# TeeLab - Proyecto Fullstack

Plataforma completa para gestionar un catálogo de camisetas y órdenes de pedidos. Consta de una API REST (Backend) y un cliente web (Frontend).

---

## 1. Estructura del proyecto (Single Page App)

```text
.
├── backend/                        # API REST (Node.js + Express)
│   ├── controllers/                # Lógica de peticiones
│   │   ├── camisetas.controller.js
│   │   └── comandas.controllers.js
│   ├── data/                       # Base de datos simulada en memoria
│   │   ├── camisetas.js
│   │   └── comandas.js
│   ├── package.json                # Configuración y dependencias del servidor
│   ├── routes/                     # Enrutadores
│   │   ├── camisetas.routes.js
│   │   └── comandas.routes.js
│   ├── server.js                   # Archivo principal del servidor
│   └── services/                   # Lógica de negocio y validaciones
│       ├── camisetas.services.js
│       └── comandas.services.js
├── frontend/                       # Cliente Web (HTML, CSS, JS)
│   └── teelab/
│       ├── img/                    # Recursos gráficos
│       │   └── FotosCamisas...
│       ├── index.html              # Punto de entrada de la aplicación
│       ├── js/                     # Lógica del cliente
│       │   ├── api.js              # Comunicación asíncrona con el backend
│       │   ├── app.js              # Lógica principal y eventos
│       │   ├── cart.js             # Gestión de la bolsa de compra
│       │   └── ui.js               # Manipulación y renderizado del DOM
│       └── style.css               # Estilos y variables de la aplicación
└── README.md                       # Esta documentación
```

---

## 2. Instalación y ejecución (Entorno Linux)

### Cómo configurar y arrancar el Backend

Abre una terminal y sigue estos pasos para configurar el entorno en tu sistema Linux (basado en Debian/Ubuntu):

1. **Instalar Node.js y npm (si no los tienes):**
   ```bash
   sudo apt update
   sudo apt install nodejs npm -y
   ```

2. **Acceder a la carpeta del backend e inicializar el proyecto:**
   ```bash
   cd backend
   npm init -y
   ```

3. **Habilitar el sistema de módulos (ES Modules):**
   Abre el archivo `package.json` que se acaba de crear y añade la propiedad `"type": "module"`. Debería verse algo así:
   ```json
   {
     "name": "backend",
     "version": "1.0.0",
     "type": "module",
     "main": "server.js",
     "scripts": {
       "test": "echo \"Error: no test specified\" && exit 1"
     },
     "keywords": [],
     "author": "",
     "license": "ISC"
   }
   ```

4. **Instalar las dependencias principales (Express y CORS):**
   ```bash
   npm install express cors
   ```

5. **Instalar Nodemon para el entorno de desarrollo:**
   ```bash
   npm install -D nodemon
   ```

6. **Arrancar el servidor en modo desarrollo:**
   ```bash
   npx nodemon server.js
   ```

*Nota: El servidor corre por defecto en http://localhost:3000*

### Cómo arrancar el Frontend

El frontend no requiere instalación de dependencias (es JavaScript puro, HTML y CSS). 

1. **Opción Recomendada:** Abre la carpeta `frontend/teelab/` en tu editor de código (como VS Code) y utiliza la extensión **Live Server** abriendo el archivo `index.html`.
2. **Opción Directa:** Navega hasta la carpeta `frontend/teelab/` en tu explorador de archivos y haz doble clic en `index.html` para abrirlo directamente en tu navegador web.

---

## 3. Endpoints utilizados

La comunicación entre el Frontend y el Backend se realiza a través de los siguientes endpoints de la API:

### Camisetas (Catálogo)

* **`GET /camisetas`**: Lista todas las camisetas. 
    * *Query params admitidos:* `talla`, `color`, `tags`, `q` (búsqueda de texto), `sort` (`precio_asc`, `precio_desc`, `nombre_asc`, `nombre_desc`).
* **`GET /camisetas/:id`**: Devuelve los detalles y stock de una camiseta específica por su ID.

### Comandas (Pedidos)

* **`GET /comandas`**: Devuelve la lista completa de pedidos creados.
* **`GET /comandas/:id`**: Devuelve los detalles de un pedido específico por su ID.
* **`POST /comandas`**: Crea un nuevo pedido. Valida datos de cliente, valida el stock disponible, genera un ID secuencial (ej. ORD-0001) y calcula el precio total.

**Ejemplo de Body (JSON) enviado a POST /comandas:**

```json
{
  "cliente": {
    "nombre": "Elvin",
    "email": "elvin@mail.com"
  },
  "direccion": {
    "calle": "Calle Falsa 123",
    "cp": "08001",
    "ciudad": "Barcelona"
  },
  "items": [
    {
      "camisetaId": "TSH01",
      "talla": "M",
      "color": "negro",
      "cantidad": 2
    }
  ]
}

```
