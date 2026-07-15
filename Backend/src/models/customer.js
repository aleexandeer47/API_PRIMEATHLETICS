import { Schema, model } from "mongoose";

const customerSchema = new Schema(
  {
    name: {
      type: String,
    },
    lastName:{
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default model("customers", customerSchema);