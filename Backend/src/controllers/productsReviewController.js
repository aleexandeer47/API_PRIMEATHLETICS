import productReviewModel from "../models/productReview.js";
import orderModel from "../models/order.js";

const productsReviewController = {};

// Obtener reviews
productsReviewController.getReviews = async (req, res) => {
  try {
    const reviews = await productReviewModel.find();
    return res.status(200).json(reviews);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Obtener review por ID
productsReviewController.getReviewById = async (req, res) => {
  try {
    const review = await productReviewModel.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json(review);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Insertar review
productsReviewController.insertReviews = async (req, res) => {
  try {
    const customer_id = req.user._id;
    let { product_id, title, rating, description, status } = req.body;

    title = title?.trim();
    description = description?.trim();

    if (!product_id || rating === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const numRating = Number(rating);

    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be a number between 1 and 5" });
    }

    // Verificar que el cliente haya comprado este producto
    const orders = await orderModel
      .find({ payment_status: true })
      .populate("shopping_cart_id");

    const hasPurchased = orders.some((order) => {
      const cart = order.shopping_cart_id;
      if (!cart || cart.customer_id?.toString() !== customer_id.toString()) {
        return false;
      }
      return cart.items?.some(
        (item) => item.product_id?.toString() === product_id.toString(),
      );
    });

    if (!hasPurchased) {
      return res.status(403).json({
        message: "Solo puedes reseñar productos que hayas comprado",
      });
    }

    // Evitar reseñas duplicadas del mismo cliente para el mismo producto
    const existingReview = await productReviewModel.findOne({
      customer_id,
      product_id,
    });

    if (existingReview) {
      return res.status(409).json({
        message: "Ya has escrito una reseña para este producto",
      });
    }

    const review = new productReviewModel({
      customer_id,
      product_id,
      title,
      rating: numRating,
      description,
      status,
    });

    await review.save();

    return res.status(201).json({ message: "Review saved" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Eliminar review
productsReviewController.deleteReviews = async (req, res) => {
  try {
    const review = await productReviewModel.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.customer_id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "No puedes eliminar esta reseña" });
    }

    await productReviewModel.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Actualizar review
productsReviewController.updateReviews = async (req, res) => {
  try {
    const review = await productReviewModel.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.customer_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "No puedes editar esta reseña" });
    }

    let { title, rating, description, status } = req.body;

    title = title?.trim();
    description = description?.trim();

    if (rating === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const numRating = Number(rating);

    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be a number between 1 and 5" });
    }

    const updatedReview = await productReviewModel.findByIdAndUpdate(
      req.params.id,
      { title, rating: numRating, description, status },
      { new: true },
    );

    return res.status(200).json({ message: "Review updated" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default productsReviewController;
