import express from 'express';
import cors from 'cors';
import camisetasRouter from './routes/camisetas.routes.js';
import comandasRouter from './routes/comandas.routes.js';

const app = express();
const PORT = 3000;

//  Configuración de CORS para el frontend 
const corsOptions = {
  origin: 'http://127.0.0.1:5500',         //Aqui es donde se encuentra el frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  optionsSuccessStatus: 200
};

// Middlewares globales
app.use(cors(corsOptions)); // Aquí aplicamos la restricción
app.use(express.json());

// Log mínimo
app.use((req, res, next) => {
 console.log(req.method, req.url);
 next();
});

// Ruta info de ApiRest
app.use('/camisetas', camisetasRouter);
app.use('/comandas', comandasRouter); 

// Middleware de errores
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  const message = err.message || "Error interno del servidor";
  
  res.status(statusCode).json({
    error: message
  });
});

app.listen(PORT, () => {
 console.log(`Servidor corriendo en http://localhost:${PORT}/`);
});