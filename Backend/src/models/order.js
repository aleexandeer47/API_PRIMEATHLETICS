import { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    shopping_cart_id: {
      type: Schema.Types.ObjectId,
      ref: "shoppingCart",
    },
    payment_method: {
      type: String,
    },
    payment_status: {
      type: Boolean,
      default: false,
    },
    order_status: {
      type: Boolean,
      default: false,
    },
    tracking_number: {
      type: String,
    },
    delivery_address: {
      type: String,
    },
    total_amount: {
      type: Number,
    },
    shipment: {
      type: Number,
    },
    delivery_date: {
      type: Date,
    },
    ordered_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    strict: false,
  },
);

export default model("orders", orderSchema);
