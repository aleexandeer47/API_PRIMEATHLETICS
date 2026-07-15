import offerModel from "../models/offers.js";
import { v2 as cloudinary } from "cloudinary";

const offerController = {};

const parseApplicableProducts = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const parseActive = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value !== "false";
  return true;
};

offerController.getOffers = async (req, res) => {
  try {
    const offers = await offerModel.find().populate("applicable_products", "name");
    return res.status(200).json(offers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

offerController.insertOffer = async (req, res) => {
  try {
    const {
      name,
      description,
      discount_percentage,
      start_date,
      end_date,
      active,
      applicable_products,
    } = req.body;

    if (!name || !discount_percentage || !start_date || !end_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parsedProducts = parseApplicableProducts(applicable_products);

    let banner = undefined;
    if (req.file) {
      banner = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    const newOffer = new offerModel({
      name: name.trim(),
      description: description?.trim(),
      discount_percentage: Number(discount_percentage),
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      active: parseActive(active),
      applicable_products: parsedProducts,
      banner,
    });

    await newOffer.save();

    return res.status(201).json({
      message: "Offer saved successfully",
      offer: newOffer,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

offerController.deleteOffer = async (req, res) => {
  try {
    const offerFound = await offerModel.findById(req.params.id);

    if (!offerFound) {
      return res.status(404).json({ message: "Offer not found" });
    }

    if (offerFound.banner && offerFound.banner.public_id) {
      await cloudinary.uploader.destroy(offerFound.banner.public_id);
    }

    await offerModel.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Offer deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

offerController.updateOffer = async (req, res) => {
  try {
    const offerFound = await offerModel.findById(req.params.id);

    if (!offerFound) {
      return res.status(404).json({ message: "Offer not found" });
    }

    const {
      name,
      description,
      discount_percentage,
      start_date,
      end_date,
      active,
      applicable_products,
    } = req.body;

    const updatedOffer = await offerModel.findByIdAndUpdate(
      req.params.id,
      {
        name: name?.trim() ?? offerFound.name,
        description: description?.trim() ?? offerFound.description,
        discount_percentage: discount_percentage !== undefined ? Number(discount_percentage) : offerFound.discount_percentage,
        start_date: start_date ? new Date(start_date) : offerFound.start_date,
        end_date: end_date ? new Date(end_date) : offerFound.end_date,
        active: active !== undefined ? parseActive(active) : offerFound.active,
        applicable_products: applicable_products !== undefined ? parseApplicableProducts(applicable_products) : offerFound.applicable_products,
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Offer updated successfully",
      offer: updatedOffer,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

offerController.updateOfferBanner = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const offer = await offerModel.findById(id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    if (offer.banner && offer.banner.public_id) {
      await cloudinary.uploader.destroy(offer.banner.public_id);
    }

    offer.banner = {
      url: req.file.path,
      public_id: req.file.filename,
    };

    await offer.save();

    return res.status(200).json({
      message: "Offer banner updated successfully",
      offer,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

offerController.getOfferByName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Missing offer name search term" });
    }

    const offers = await offerModel.find({
      name: { $regex: name.trim(), $options: "i" },
    }).populate("applicable_products", "name");

    return res.status(200).json(offers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default offerController;