import productReviewModel from "../models/productReview.js";

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
    let {
      customer_id,
      product_id,
      title,
      rating,
      description,
      status,
      reviewed_at,
    } = req.body;

    title = title?.trim();
    description = description?.trim();

    if (!customer_id || !product_id || rating === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const numRating = Number(rating);

    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be a number between 1 and 5" });
    }

    const review = new productReviewModel({
      customer_id,
      product_id,
      title,
      rating: numRating,
      description,
      status,
      reviewed_at,
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
    const deletedReview = await productReviewModel.findByIdAndDelete(
      req.params.id,
    );

    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Actualizar review
productsReviewController.updateReviews = async (req, res) => {
  try {
    let {
      customer_id,
      product_id,
      title,
      rating,
      description,
      status,
      reviewed_at,
    } = req.body;

    title = title?.trim();
    description = description?.trim();

    if (!customer_id || !product_id || rating === undefined) {
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
      {
        customer_id,
        product_id,
        title,
        rating: numRating,
        description,
        status,
        reviewed_at,
      },
      { new: true },
    );

    if (!updatedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json({ message: "Review updated" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default productsReviewController;
