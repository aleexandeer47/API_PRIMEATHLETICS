import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
    },
    brand: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["hombre", "mujer", "niño", "niña", "unisex"],
    },
    category: {
      type: String,
    },
    productType: {
      type: String,
    },
    size: {
      type: String,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    price: {
      type: Number,
    },
    discount: {
      type: String,
    },
    amount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default model("Product", productSchema);