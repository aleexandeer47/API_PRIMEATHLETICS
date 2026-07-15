import { Schema, model } from "mongoose";

const bannerSchema = new Schema(
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
  }
);

const offerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    discount_percentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },

    banner: {
      type: bannerSchema,
      required: false,
    }, // 👈 CORREGIDO: Faltaba cerrar esta llave y poner la coma

    start_date: {
      type: Date,
      required: true,
    },

    end_date: {
      type: Date,
      required: true,
    },

    active: {
      type: Boolean,
      default: true,
    }, 

    applicable_products: [
      {
        type: Schema.Types.ObjectId,
        ref: "products",
      },
    ],
  }, 
  {
    timestamps: true,
  }
); 

export default model("offers", offerSchema);