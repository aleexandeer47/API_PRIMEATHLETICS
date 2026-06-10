import mongoose, { Schema, model } from "mongoose";

const NewsSchema = new Schema(
  {
    title: {
      type: String,
    },

    subtitle: {
      type: String,
    },

    description: {
      type: String,
    },

    bannerImage: {
      type: String,
    },

    public_idBanner: {
      type: String,
    },

    cardImage: {
      type: String,
    },
    public_idCard: {
      type: String,
    },

    category: {
      type: String,
      enum: [
        "collaboration",
        "launch",
        "event",
        "announcement"
      ],
    },

    releaseDate: {
      type: Date,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "published",
        "archived"
      ],
      default: "draft",
    },

    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default model("news", NewsSchema);