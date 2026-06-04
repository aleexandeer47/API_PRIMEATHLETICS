import supplierModel from "../models/supplier.js";

const supliersController = {};

// Obtener suppliers
supliersController.getSuppliers = async (req, res) => {
  try {
    const suppliers = await supplierModel.find();
    return res.status(200).json(suppliers);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Obtener supplier por ID
supliersController.getSupplierById = async (req, res) => {
  try {
    const supplier = await supplierModel.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    return res.status(200).json(supplier);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Insertar supplier
supliersController.insertSupplier = async (req, res) => {
  try {
    let { name, contactName, phoneNumber, email, location, status } = req.body;
    name = name?.trim();
    contactName = contactName?.trim();
    phoneNumber = phoneNumber?.trim();
    email = email?.trim();
    location = location?.trim();

    if (!name || !contactName || !phoneNumber || !email || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (name.length < 3) {
      return res.status(400).json({ message: "Name too short" });
    }
    if (email.length > 100) {
      return res.status(400).json({ message: "Email too long" });
    }

    const existSupplier = await supplierModel.findOne({ email });
    if (existSupplier) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const supplier = new supplierModel({
      name,
      contactName,
      phoneNumber,
      email,
      location,
      status,
    });
    await supplier.save();
    return res.status(201).json({ message: "Supplier saved" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Eliminar supplier
supliersController.deleteSupplier = async (req, res) => {
  try {
    const deletedSupplier = await supplierModel.findByIdAndDelete(req.params.id);
    if (!deletedSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    return res.status(200).json({ message: "Supplier deleted" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Actualizar supplier
supliersController.updateSupplier = async (req, res) => {
  try {
    let { name, contactName, phoneNumber, email, location, status } = req.body;
    name = name?.trim();
    contactName = contactName?.trim();
    phoneNumber = phoneNumber?.trim();
    email = email?.trim();
    location = location?.trim();

    if (!name || !contactName || !phoneNumber || !email || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (name.length < 3) {
      return res.status(400).json({ message: "Name too short" });
    }
    if (email.length > 100) {
      return res.status(400).json({ message: "Email too long" });
    }

    const updatedSupplier = await supplierModel.findByIdAndUpdate(
      req.params.id,
      { name, contactName, phoneNumber, email, location, status },
      { new: true }
    );
    if (!updatedSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    return res.status(200).json({ message: "Supplier updated" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default supliersController;