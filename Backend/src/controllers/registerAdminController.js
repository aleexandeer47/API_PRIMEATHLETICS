import nodemailer from "nodemailer";
import crypto from "crypto";
import JsonWebToken from "jsonwebtoken";
import bcryptjs from "bcryptjs";

import adminModel from "../models/admin.js";

import { config } from "../config.js";

const registerAdminController = {};

registerAdminController.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existAdmin = await adminModel.findOne({ email });
    if (existAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const passwordHash = await bcryptjs.hash(password, 10);

    const newAdmin = new adminModel({
      name,
      email,
      password: passwordHash,
      status: true,
      isVerified: false,
      loginAttempts: 0,
      timeOut: null,
    });

    await newAdmin.save();

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
      subject: "Verificación de cuenta - Admin",
      text:
        "Para verificar tu cuenta de administrador, utiliza este código: " +
        verificationCode +
        " — expira en 15 minutos.",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error al enviar el correo" });
      }

      res.status(200).json({ message: "Admin registrado. Correo enviado." });
    });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

registerAdminController.verifyCode = async (req, res) => {
  try {
    const { verificationCode } = req.body;
    const token = req.cookies.verificationTokenCookie;

    const decoded = JsonWebToken.verify(token, config.JWT.secret);
    const { email, verificationCode: storedCode } = decoded;

    if (verificationCode !== storedCode) {
      return res.status(400).json({ message: "Código inválido" });
    }

    const admin = await adminModel.findOne({ email });
    admin.isVerified = true;
    await admin.save();

    res.clearCookie("verificationTokenCookie");
    return res.status(200).json({ message: "Correo verificado exitosamente" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default registerAdminController;