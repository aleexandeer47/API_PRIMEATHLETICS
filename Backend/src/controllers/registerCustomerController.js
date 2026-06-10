import nodemailer from "nodemailer";
import crypto from "crypto";
import JsonWebToken from "jsonwebtoken";
import bcryptjs from "bcryptjs";

import customerModel from "../models/customer.js";

import { config } from "../config.js";

const registerCustomerController = {};

registerCustomerController.register = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, address } = req.body;

    const existCustomer = await customerModel.findOne({ email });
    if (existCustomer) {
      return res.status(400).json({ message: "Customer already exists" });
    }

    const passwordHash = await bcryptjs.hash(password, 10);

    const newCustomer = new customerModel({
      name,
      email,
      password: passwordHash,
      phoneNumber,
      address,
      status: true,
      isVerified: false,
      loginAttempts: 0,
      timeOut: null,
      registeredAt: new Date(),
    });

    await newCustomer.save();

    const verificationCode = crypto.randomBytes(3).toString("hex");

    const tokenCode = JsonWebToken.sign(
      { email, verificationCode },
      config.JWT.secret,
      { expiresIn: "15m" }
    );

    res.cookie("verificationTokenCookie", tokenCode, {
      maxAge: 15 * 60 * 1000,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.email.user_email,
        pass: config.email.user_password,
      },
    });

    const mailOptions = {
      from: config.email.user_email,
      to: email,
      subject: "Verificación de cuenta - PrimeAthletics",
      text:
        "Para verificar tu cuenta, utiliza este código: " +
        verificationCode +
        " — expira en 15 minutos.",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error al enviar el correo" });
      }

      res
        .status(200)
        .json({ message: "Cliente registrado. Correo enviado." });
    });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

registerCustomerController.verifyCode = async (req, res) => {
  try {
    const { verificationCode } = req.body;
    const token = req.cookies.verificationTokenCookie;

    const decoded = JsonWebToken.verify(token, config.JWT.secret);
    const { email, verificationCode: storedCode } = decoded;

    if (verificationCode !== storedCode) {
      return res.status(400).json({ message: "Código inválido" });
    }

    const customer = await customerModel.findOne({ email });    
    customer.isVerified = true;
    await customer.save();

    res.clearCookie("verificationTokenCookie");
    return res.status(200).json({ message: "Correo verificado exitosamente" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default registerCustomerController;