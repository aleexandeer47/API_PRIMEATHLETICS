import customerModel from "../models/customer.js";
import bcryptjs from "bcryptjs";

const customersController = {};

// Obtener customers
customersController.getCustomers = async (req, res) => {
  try {
    const customers = await customerModel.find().select("-password");
    return res.status(200).json(customers);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Obtener customer por ID
customersController.getCustomerById = async (req, res) => {
  try {
    const customer = await customerModel.findById(req.params.id).select("-password");
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    return res.status(200).json(customer);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Eliminar customer
customersController.deleteCustomer = async (req, res) => {
  try {
    const deletedCustomer = await customerModel.findByIdAndDelete(req.params.id);
    if (!deletedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    return res.status(200).json({ message: "Customer deleted" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Actualizar customer
customersController.updateCustomer = async (req, res) => {
  try {
    let { name, email, password, phoneNumber, address, status, isVerified } =
      req.body;
    name = name?.trim();
    email = email?.trim();
    password = password?.trim();
    phoneNumber = phoneNumber?.trim();
    address = address?.trim();

    if (!name || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (name.length < 3) {
      return res.status(400).json({ message: "Name too short" });
    }
    if (email.length > 100) {
      return res.status(400).json({ message: "Email too long" });
    }

    const updateData = {
      name,
      email,
      phoneNumber,
      address,
      status,
      isVerified,
    };

    if (password && password.length > 0) {
      if (password.length < 8) {
        return res.status(400).json({ message: "Password too short" });
      }
      updateData.password = await bcryptjs.hash(password, 10);
    }

    const updatedCustomer = await customerModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    return res.status(200).json({ message: "Customer updated" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default customersController;