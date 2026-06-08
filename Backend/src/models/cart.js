import { Schema, model } from "mongoose";

const shoppingCartSchema = new Schema(
  {
    customer_id: {
      type: Schema.Types.ObjectId,
      ref: "customers",
    },
    items: [
      {
        product_id: {
          type: Schema.Types.ObjectId,
          ref: "products",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        subtotal: {
          type: Number,
        },
      },
    ],
    total_before_discount: {
      type: Number,
    },
    total_savings: {
      type: Number,
    },
    total_after_discount: {
      type: Number,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    strict: false,
    collection: "shoppingCart",
  },
);

export default model("shoppingCart", shoppingCartSchema);
