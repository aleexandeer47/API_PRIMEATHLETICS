import jsonwebtoken from "jsonwebtoken";
import { config } from "../src/config.js";
import adminModel from "../src/models/admin.js";
import customerModel from "../src/models/customer.js";
import employeeModel from "../src/models/employee.js";

export const protect = async (req, res, next) => {
  let token;

  // 1) Leer token de las cookies
  if (req.cookies && req.cookies.authCookie) {
    token = req.cookies.authCookie;
  }
  // 2) Fallback a cabecera Authorization (Bearer)
  else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "No autorizado, sesión ausente" });
  }

  try {
    // Verificar token
    const decoded = jsonwebtoken.verify(token, config.JWT.secret);

    // Buscar el usuario en la BD de acuerdo a su tipo
    let user;
    if (decoded.userType === "admin") {
      user = await adminModel.findById(decoded.id).select("-password");
    } else if (decoded.userType === "customer") {
      user = await customerModel.findById(decoded.id).select("-password");
    } else if (decoded.userType === "employee") {
      user = await employeeModel.findById(decoded.id).select("-password");
    }

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    if (!user.status) {
      return res.status(403).json({ message: "Cuenta desactivada" });
    }

    // Inyectar usuario en la petición
    req.user = user;
    req.userType = decoded.userType; // 'admin', 'customer', 'employee'

    next();
  } catch (error) {
    console.error("Error de autenticación:", error);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userType)) {
      return res.status(403).json({
        message: "No tienes permisos para realizar esta acción"
      });
    }
    next();
  };
};
