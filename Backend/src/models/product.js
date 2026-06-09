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
      trim: true,
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
      lowercase: true,
      enum: ["nike", "adidas", "puma"],
    },

    gender: {
      type: String,
      required: true,
      enum: ["hombres", "mujeres", "ninos", "ninas", "unisex"],
    },

    category: {
      type: String,
      required: true,
      enum: ["ropa", "zapatos"],
    },

    product_type: {
      type: String,
      required: true,
      enum: ["camiseta", "pants", "short", "calcetas", "tenis", "sandalias"],
    },

    sport: {
      type: String,
      default: "training",
      enum: [
        "training",
        "gym",
        "running",
        "basketball",
        "football_turf",
        "football_indoor",
        "volleyball",
        "crossfit",
        "trail_running",
      ],
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

    featured: {
      type: Boolean,
      default: false,
    },

    active: {
      type: Boolean,
      default: true,
    },

    variants: {
      type: [variantSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default model("products", productSchema);
