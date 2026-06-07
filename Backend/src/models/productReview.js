import { Schema, model } from "mongoose";

const productReviewSchema = new Schema(
  {
    customer_id: {
      type: Schema.Types.ObjectId,
      ref: "customers",
    },
    product_id: {
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
    reviewed_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    strict: false,
    collection: "productsReview",
  },
);

export default model("productsReview", productReviewSchema);
