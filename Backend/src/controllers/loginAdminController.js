import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

import adminModel from "../models/admin.js";

import { config } from "../config.js";

const loginAdminController = {};

loginAdminController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminFound = await adminModel.findOne({ email });

    if (!adminFound) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (!adminFound.status) {
      return res.status(403).json({ message: "Cuenta desactivada" });
    }

    if (adminFound.timeOut && adminFound.timeOut > Date.now()) {
      return res.status(403).json({ message: "Cuenta bloqueada" });
    }

    const isMatch = await bcrypt.compare(password, adminFound.password);

    if (!isMatch) {
      adminFound.loginAttempts = (adminFound.loginAttempts || 0) + 1;

      if (adminFound.loginAttempts >= 5) {
        adminFound.timeOut = Date.now() + 15 * 60 * 1000;
        adminFound.loginAttempts = 0;

        await adminFound.save();
        return res.status(403).json({ message: "Cuenta bloqueada" });
      }

      await adminFound.save();
      return res.status(403).json({ message: "Contraseña incorrecta" });
    }

    adminFound.loginAttempts = 0;
    adminFound.timeOut = null;
    await adminFound.save();

    const token = jsonwebtoken.sign(
      { id: adminFound._id, userType: "admin" },
      config.JWT.secret,
      { expiresIn: "30d" }
    );

    res.cookie("authCookie", token);

    return res.status(200).json({ message: "Login exitoso" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default loginAdminController;