import employeeModel from "../models/employee.js";

const employeesController = {};

// Obtener employees
employeesController.getEmployees = async (req, res) => {
  try {
    const employees = await employeeModel.find();
    return res.status(200).json(employees);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Obtener employee por ID
employeesController.getEmployeeById = async (req, res) => {
  try {
    const employee = await employeeModel.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    return res.status(200).json(employee);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Eliminar employee
employeesController.deleteEmployee = async (req, res) => {
  try {
    const deletedEmployee = await employeeModel.findByIdAndDelete(req.params.id);
    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    return res.status(200).json({ message: "Employee deleted" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Actualizar employee
employeesController.updateEmployee = async (req, res) => {
  try {
    let {
      name,
      email,
      password,
      phoneNumber,
      address,
      position,
      hireDate,
      status,
      isVerified,
    } = req.body;
    name = name?.trim();
    email = email?.trim();
    password = password?.trim();
    phoneNumber = phoneNumber?.trim();
    address = address?.trim();
    position = position?.trim();

    if (!name || !email || !password || !position) {
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

    const updatedEmployee = await employeeModel.findByIdAndUpdate(
      req.params.id,
      { name, email, password, phoneNumber, address, position, hireDate, status, isVerified },
      { new: true }
    );
    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    return res.status(200).json({ message: "Employee updated" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default employeesController;