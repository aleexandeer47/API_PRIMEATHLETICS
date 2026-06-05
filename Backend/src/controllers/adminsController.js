import adminModel from "../models/admin.js";

const adminsController = {};

// Obtener admins
adminsController.getAdmins = async (req, res) => {
  try {
    const admins = await adminModel.find();
    return res.status(200).json(admins);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Obtener admin por ID
adminsController.getAdminById = async (req, res) => {
  try {
    const admin = await adminModel.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    return res.status(200).json(admin);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Eliminar admin
adminsController.deleteAdmin = async (req, res) => {
  try {
    const deletedAdmin = await adminModel.findByIdAndDelete(req.params.id);
    if (!deletedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    return res.status(200).json({ message: "Admin deleted" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Actualizar admin
adminsController.updateAdmin = async (req, res) => {
  try {
    let { name, email, password, status, isVerified } = req.body;
    name = name?.trim();
    email = email?.trim();
    password = password?.trim();

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (name.length < 3) {
      return res.status(400).json({ message: "Name too short" });
    }
    if (email.length > 100) {
      return res.status(400).json({ message: "Email too long" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password too short" });
    }

    const updatedAdmin = await adminModel.findByIdAndUpdate(
      req.params.id,
      { name, email, password, status, isVerified },
      { new: true }
    );
    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    return res.status(200).json({ message: "Admin updated" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default adminsController;