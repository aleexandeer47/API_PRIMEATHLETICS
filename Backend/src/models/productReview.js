import { Schema, model } from "mongoose";

const productReviewSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "customers",
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "products",
    },
    title: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    description: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
    },
    reviewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default model("productreviews", productReviewSchema);