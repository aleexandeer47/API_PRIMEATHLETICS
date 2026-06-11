import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

import employeeModel from "../models/employee.js";

import { config } from "../config.js";

const loginEmployeeController = {};

loginEmployeeController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employeeFound = await employeeModel.findOne({ email });

    if (!employeeFound) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (!employeeFound.status) {
      return res.status(403).json({ message: "Cuenta desactivada" });
    }

    if (employeeFound.timeOut && employeeFound.timeOut > Date.now()) {
      return res.status(403).json({ message: "Cuenta bloqueada" });
    }

    let isMatch = false;
    const isBcryptHash = employeeFound.password && employeeFound.password.startsWith('$') && employeeFound.password.length === 60;

    if (isBcryptHash) {
      isMatch = await bcrypt.compare(password, employeeFound.password);
    } else {
      isMatch = (password === employeeFound.password);
      if (isMatch) {
        // Migrar contraseña de texto plano a bcrypt hash
        const passwordHash = await bcrypt.hash(password, 10);
        employeeFound.password = passwordHash;
      }
    }

    if (!isMatch) {
      employeeFound.loginAttempts = (employeeFound.loginAttempts || 0) + 1;

      if (employeeFound.loginAttempts >= 5) {
        employeeFound.timeOut = Date.now() + 15 * 60 * 1000;
        employeeFound.loginAttempts = 0;

        await employeeFound.save();
        return res.status(403).json({ message: "Cuenta bloqueada" });
      }

      await employeeFound.save();
      return res.status(403).json({ message: "Contraseña incorrecta" });
    }

    employeeFound.loginAttempts = 0;
    employeeFound.timeOut = null;
    await employeeFound.save();

    const token = jsonwebtoken.sign(
      { id: employeeFound._id, userType: "employee" },
      config.JWT.secret,
      { expiresIn: "30d" }
    );

    res.cookie("authCookie", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    });

    return res.status(200).json({
      message: "Login exitoso",
      user: {
        id: employeeFound._id,
        name: employeeFound.name,
        email: employeeFound.email,
        role: "employee"
      }
    });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default loginEmployeeController;