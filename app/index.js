import  express  from "express";
import cookieParser from 'cookie-parser';
//Fix para __direname
import path from 'path';
import {fileURLToPath} from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import * as authentication from "./controllers/authentication.controller.js";
import {connectDB} from "./config/db.js"
import * as authorization from "./middlewares/authorization.js";
import http from 'http';
import { Server } from 'socket.io';
import multer from 'multer';
import { z } from 'zod'; 
import mongoose from "mongoose";

//Server
const app = express();
const main = async () => {
    try {
    await connectDB()
    server.listen(8080, () => {
      console.log('Servidor corriendo en http://localhost:8080');
    });
    
    } catch (error) {
    console.error(error)
    process.exit(1)
    }
}
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("Usuario conectado");

  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("typing", (name) => {
    io.emit("typing", name);
  });

  socket.on("stopTyping", () => {
    io.emit("stopTyping");
  });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

connectDB();

mongoose.connect('mongodb://127.0.0.1:27017/patitas',);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
  console.log('Conectado a MongoDB');
});

// Definir el esquema de validación con Zod
const fileSchema = z.object({
  archivo: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    buffer: z.string(),
    size: z.number(),
  }),
});

// Definir el esquema del modelo para la colección de archivos
const archivoSchema = new mongoose.Schema({
  imagen: {
    type: String,  
  },
  animal: String,
  direccion: String,
  descripcion: String,
});

const Archivo = mongoose.model('Archivo', archivoSchema);




// Ruta para manejar la subida de archivos
app.post('/subir-archivo', upload.single('imagen'), async (req, res) => {
  try {
    const { animal, direccion, descripcion } = req.body;
    const imagenPath = req.file.filename; // Obtener el nombre del archivo

    // Crear instancia del modelo antes de intentar guardarlo
    const nuevoArchivo = new Archivo({
      animal,
      direccion,
      descripcion,
      imagen: `/uploads/${imagenPath}`, // Guardar la referencia al archivo como una ruta
    });

    // Guardar la información en MongoDB
    await nuevoArchivo.save();

    res.status(200).json({
      success: true,
      mensaje: 'Archivo subido exitosamente',
      archivo: {
        animal,
        direccion,
        descripcion,
        imagenUrl: `/uploads/${imagenPath}`, 
      },
    });
  } catch (error) {
    console.error("Error al subir el archivo:", error.message);
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor' });
  }
});


//Configuración

app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//Rutas
app.get("/",authorization.soloPublico, (req,res)=> res.sendFile(__dirname + "/pages/index.html"));
app.get("/login",authorization.soloPublico, (req,res)=> res.sendFile(__dirname + "/pages/login.html"));
app.get("/register",authorization.soloPublico, (req,res)=> res.sendFile(__dirname + "/pages/register.html"));
app.get("/castracion",authorization.soloPublico, (req,res)=> res.sendFile(__dirname + "/pages/castracion.html"));
app.get("/rescates",authorization.soloPublico,(req,res)=> res.sendFile(__dirname + "/pages/rescates.html"));
app.get("/veterinarias",authorization.soloPublico, (req,res)=> res.sendFile(__dirname + "/pages/veterinarias.html"));
app.get("/chat",authorization.soloPublico, (req,res)=> res.sendFile(__dirname + "/pages/chat.html"));
app.get("/admin",(req, res) => res.sendFile(__dirname + "/pages/admin.html"));
app.post("/api/login",authentication.login);
app.post("/users",authentication.register);
app.use("/users", authentication.register)
app.use(express.static(path.join(__dirname, 'public')));





main()

app.use((err, req, res, next) => {
console.error(err.stack);
    res.status(500).send('Internal Server Error');
}); 


