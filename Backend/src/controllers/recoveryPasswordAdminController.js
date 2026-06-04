import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import HTMLRecoveryEmail from "../utils/sendMailRecoveryPassowrd.js";
import { config } from "../config.js";
import adminModel from "../models/admin.js";

const recoveryPasswordAdminController = {};

recoveryPasswordAdminController.requestCode = async (req, res) => {
  try {
    const { email } = req.body;

    const adminFound = await adminModel.findOne({ email });
    if (!adminFound) {
      return res.status(400).json({ message: "Admin not found" });
    }

    const randomCode = crypto.randomBytes(3).toString("hex");

    const token = jsonwebtoken.sign(
      {
        email,
        randomCode,
        userType: "admin",
        verified: false,
      },
      config.JWT.secret,
      { expiresIn: "15m" }
    );

    res.cookie("recoveryCookie", token, { maxAge: 15 * 60 * 1000 });

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
      subject: "Código de recuperación de contraseña - Admin",
      text: "El código expira en 15 minutos",
      html: HTMLRecoveryEmail(randomCode),
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Error al enviar el correo" });
      }
      res.status(200).json({ message: "Correo enviado exitosamente" });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

recoveryPasswordAdminController.verifyCode = async (req, res) => {
  try {
    const { code } = req.body;
    const token = req.cookies.recoveryCookie;

    const decoded = jsonwebtoken.verify(token, config.JWT.secret);

    if (code !== decoded.randomCode) {
      return res.status(400).json({ message: "Código incorrecto" });
    }

    const newToken = jsonwebtoken.sign(
      {
        email: decoded.email,
        userType: "admin",
        verified: true,
      },
      config.JWT.secret,
      { expiresIn: "15m" }
    );

    res.cookie("recoveryCookie", newToken, { maxAge: 15 * 60 * 1000 });
    return res.status(200).json({ message: "Código verificado exitosamente" });
  } catch (error) {
    console.log("error " + error);
    res.status(500).json({ message: error.message });
  }
};

recoveryPasswordAdminController.newPassword = async (req, res) => {
  try {
    const { newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "Las contraseñas no coinciden" });
    }

    const token = req.cookies.recoveryCookie;
    const decoded = jsonwebtoken.verify(token, config.JWT.secret);

    if (!decoded.verified) {
      return res.status(400).json({ message: "Código no verificado" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await adminModel.findOneAndUpdate(
      { email: decoded.email },
      { password: passwordHash },
      { new: true }
    );

    res.clearCookie("recoveryCookie");
    return res.status(200).json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.log("error " + error);
    res.status(500).json({ message: error.message });
  }
};

export default recoveryPasswordAdminController;