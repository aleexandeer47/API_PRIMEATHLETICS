import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

import customerModel from "../models/customer.js";

import { config } from "../config.js";

const loginCustomerController = {};

loginCustomerController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const customerFound = await customerModel.findOne({ email });

    if (!customerFound) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (!customerFound.status) {
      return res.status(403).json({ message: "Cuenta desactivada" });
    }

    if (customerFound.timeOut && customerFound.timeOut > Date.now()) {
      return res.status(403).json({ message: "Cuenta bloqueada" });
    }

    let isMatch = false;
    const isBcryptHash = customerFound.password && customerFound.password.startsWith('$') && customerFound.password.length === 60;

    if (isBcryptHash) {
      isMatch = await bcrypt.compare(password, customerFound.password);
    } else {
      isMatch = (password === customerFound.password);
      if (isMatch) {
        // Migrar contraseña de texto plano a bcrypt hash
        const passwordHash = await bcrypt.hash(password, 10);
        customerFound.password = passwordHash;
      }
    }

    if (!isMatch) {
      customerFound.loginAttempts = (customerFound.loginAttempts || 0) + 1;

      if (customerFound.loginAttempts >= 5) {
        customerFound.timeOut = Date.now() + 15 * 60 * 1000;
        customerFound.loginAttempts = 0;

        await customerFound.save();
        return res.status(403).json({ message: "Cuenta bloqueada" });
      }

      await customerFound.save();
      return res.status(403).json({ message: "Contraseña incorrecta" });
    }

    customerFound.loginAttempts = 0;
    customerFound.timeOut = null;
    await customerFound.save();

    const token = jsonwebtoken.sign(
      { id: customerFound._id, userType: "customer" },
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
        id: customerFound._id,
        name: customerFound.name,
        email: customerFound.email,
        role: "customer"
      }
    });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default loginCustomerController;