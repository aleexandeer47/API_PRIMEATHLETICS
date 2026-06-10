import express from "express";
import adminRoutes from "./src/routes/admin.js";
import customerRoutes from "./src/routes/customer.js";
import employeeRoutes from "./src/routes/employee.js";
import loginAdminRoutes from "./src/routes/loginAdmin.js";
import loginCustomerRoutes from "./src/routes/loginCustomer.js";
import loginEmployeeRoutes from "./src/routes/loginEmployee.js";
import logoutRoutes from "./src/routes/logout.js";
import orderRoutes from "./src/routes/order.js";
import productRoutes from "./src/routes/product.js";
import productReview from "./src/routes/productReview.js";
import cartRoutes from "./src/routes/cart.js";
import registerEmployeeRoutes from "./src/routes/registerEmployees.js";
import registerAdminRoutes from "./src/routes/registerAdmins.js";
import registerCustomerRoutes from "./src/routes/registerCustomers.js";
import recoveryPasswordAdminRoutes from "./src/routes/recoveryPasswordAdmin.js";
import recoveryPasswordCustomerRoutes from "./src/routes/recoveryPasswordCustomer.js";
import recoveryPasswordEmployeeRoutes from "./src/routes/recoveryPasswordEmployee.js";
import suppliersRoutes from "./src/routes/supplier.js";
import wompiRoutes from "./src/routes/wompiToken.js";
import newsRoutes from "./src/routes/news.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    // permitir el envio de cookies y credenciales
    credentials: true,
  }),
);

app.use(cookieParser());

app.use(express.json());

app.use("/api/admins", adminRoutes); //
app.use("/api/customers", customerRoutes); //
app.use("/api/employees", employeeRoutes); //
app.use("/api/loginAdmin", loginAdminRoutes); //
app.use("/api/loginCustomers", loginCustomerRoutes); //
app.use("/api/loginEmployees", loginEmployeeRoutes); //
app.use("/api/logout", logoutRoutes); //
app.use("/api/orders", orderRoutes); //
app.use("/api/products", productRoutes); //
app.use("/api/productsReview", productReview); //
app.use("/api/shoppingCart", cartRoutes);
app.use("/api/recoveryPasswordAdmin", recoveryPasswordAdminRoutes); //
app.use("/api/recoveryPasswordCustomer", recoveryPasswordCustomerRoutes); //
app.use("/api/recoveryPasswordEmployee", recoveryPasswordEmployeeRoutes); //
app.use("/api/suppliers", suppliersRoutes); //
app.use("/api/wompi", wompiRoutes);
app.use("/api/registerEmployees", registerEmployeeRoutes); //
app.use("/api/registerAdmin", registerAdminRoutes); //
app.use("/api/registerCustomer", registerCustomerRoutes); //
app.use("/api/news", newsRoutes); 

export default app;
