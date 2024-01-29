// authentication.controller.js
import bcryptjs from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import { User } from '../model/user.model.js';


async function login(req, res) {
  const { user, password } = req.body;

  try {
    const existingUser = await User.findOne({ user });

    if (!existingUser) {
      return res.status(400).send({ status: 'Error', message: 'Usuario no encontrado' });
    }

    const loginCorrecto = await bcryptjs.compare(password, existingUser.password);

    if (!loginCorrecto) {
      return res.status(400).send({ status: 'Error', message: 'Contraseña incorrecta' });
    }

    // Genera y firma el token si la autenticación es exitosa
    const token = jsonwebtoken.sign(
      { user: existingUser.user },
      'claveSecretaTemporal',
      { expiresIn: '24h' }
    );

    console.log('Token generado:', token);

    // Almacena el token en localStorage o sessionStorage
    res.send({ status: 'ok', message: 'Usuario logueado', redirect: '/', token });
  } catch (error) {
    console.error('Error durante el inicio de sesión:', error.message);
    return res.status(500).send({ status: 'Error', message: 'Error interno del servidor' });
  }
}
async function register(req, res) {
  const { user, password, email } = req.body;

  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ user });

    if (existingUser) {
      return res.status(400).send({ status: 'Error', message: 'Este usuario ya existe' });
    }

    // Hash de la contraseña
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    // Crear nuevo usuario
    const newUser = new User({
      user,
      email,
      password: hashPassword,
    });

    // Guardar el nuevo usuario en la base de datos
    await newUser.save();

    return res.status(201).send({ status: 'ok', message: `Usuario ${newUser.user} agregado`, redirect: '/' });
  } catch (error) {
    console.error('Error durante el registro:', error.message);
    return res.status(500).send({ status: 'Error', message: 'Error interno del servidor' });
  }
}

async function getUser(username) {
  return User.findOne({ user: username });
}

async function logout(req, res) {
  res.clearCookie('jwt');
  res.send({ status: 'ok', message: 'Sesión cerrada correctamente' });


}


export { login, register, getUser, logout };
