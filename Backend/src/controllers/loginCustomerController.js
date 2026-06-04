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

    const isMatch = await bcrypt.compare(password, customerFound.password);

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

    res.cookie("authCookie", token);

    return res.status(200).json({ message: "Login exitoso" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default loginCustomerController;