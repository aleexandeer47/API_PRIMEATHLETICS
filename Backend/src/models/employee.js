import { Schema, model } from "mongoose";

const employeeSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
    },
    phoneNumber: {
      type: String,
    },
    address: {
      type: String,
    },
    position: {
      type: String,
    },
    hireDate: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default model("Employee", employeeSchema);