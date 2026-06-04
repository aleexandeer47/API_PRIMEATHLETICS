import { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    shoppingCartId: {
      type: Schema.Types.ObjectId,
      ref: "ShoppingCart",
    },
    paymentMethod: {
      type: String,
    },
    paymentStatus: {
      type: Boolean,
      default: false,
    },
    orderStatus: {
      type: Boolean,
      default: false,
    },
    trackingNumber: {
      type: String,
    },
    deliveryAddress: {
      type: String,
    },
    totalAmount: {
      type: Number,
    },
    shipment: {
      type: Number,
    },
    deliveryDate: {
      type: Date,
    },
    orderedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default model("Order", orderSchema);