import { Schema, model } from "mongoose";

const sizeSchema = new Schema(
  {
    size: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  },
);

const imageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const variantSchema = new Schema(
  {
    color: {
      type: String,
      required: true,
    },

    images: {
      type: [imageSchema],
      default: [],
    },

    sizes: {
      type: [sizeSchema],
      default: [],
    },
  },
  {
    _id: false,
  },
);

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["hombres", "mujeres", "ninos", "ninas", "unisex"],
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    product_type: {
      type: String,
      required: true,
      trim: true,
    },

    sport: {
      type: String,
      default: "training",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    variants: {
      type: [variantSchema],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default model("products", productSchema);
