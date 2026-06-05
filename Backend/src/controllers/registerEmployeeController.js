import nodemailer from "nodemailer";
import crypto from "crypto";
import JsonWebToken from "jsonwebtoken";
import bcryptjs from "bcryptjs";

import employeeModel from "../models/employee.js";

import { config } from "../config.js";

const registerEmployeeController = {};

registerEmployeeController.register = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, address, position, hireDate } =
      req.body;

    const existEmployee = await employeeModel.findOne({ email });
    if (existEmployee) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    const passwordHash = await bcryptjs.hash(password, 10);

    const newEmployee = new employeeModel({
      name,
      email,
      password: passwordHash,
      phoneNumber,
      address,
      position,
      hireDate,
      status: true,
      isVerified: false,
      loginAttempts: 0,
      timeOut: null,
    });

    await newEmployee.save();

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
      subject: "Verificación de cuenta - Empleado",
      text:
        "Para verificar tu cuenta de empleado, utiliza este código: " +
        verificationCode +
        " — expira en 15 minutos.",
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Empleado registrado. Correo enviado." });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

registerEmployeeController.verifyCode = async (req, res) => {
  try {
    const { verificationCode } = req.body;
    const token = req.cookies.verificationTokenCookie;

    const decoded = JsonWebToken.verify(token, config.JWT.secret);
    const { email, verificationCode: storedCode } = decoded;

    if (verificationCode !== storedCode) {
      return res.status(400).json({ message: "Código inválido" });
    }

    const employee = await employeeModel.findOne({ email });
    employee.isVerified = true;
    await employee.save();

    res.clearCookie("verificationTokenCookie");
    return res.status(200).json({ message: "Correo verificado exitosamente" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default registerEmployeeController;