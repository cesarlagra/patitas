
import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';
import { login, register, getUser, logout } from './../controllers/authentication.controller.js';
import { User } from '../model/user.model.js';

dotenv.config();


function soloAdmin(req, res, next) {
  const logueado = revisarCookie(req);
  if (logueado) return next();
  return res.redirect('/admin');
}

function soloPublico(req, res, next) {
  const logueado = revisarCookie(req);
  if (!logueado) return next();
  return res.redirect('/');
}

function revisarCookie(req) {
  try {
    const cookieJWT = req.headers.cookie.split('; ').find((cookie) => cookie.startsWith('jwt=')).slice(4);
    const decodificada = jsonwebtoken.verify(cookieJWT, process.env.JWT_SECRET);
    console.log(decodificada);
    const usuarioAResvisar = getUser(decodificada.user);
    console.log(usuarioAResvisar);
    if (!usuarioAResvisar) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}




export { soloAdmin, soloPublico, revisarCookie  };
