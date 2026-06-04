import { Schema, model } from "mongoose";

const supplierSchema = new Schema(
  {
    name: {
      type: String,
    },
    contactName: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
    },
    location: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default model("Supplier", supplierSchema);