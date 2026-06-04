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

// Insertar reviews
productsReviewController.insertReviews = async (req, res) => {
  try {
    let {
      customerId,
      idEmployee,
      productId,
      idProduct,
      title,
      rating,
      description,
      comment,
      status,
    } = req.body;

    const finalCustomerId = customerId || idEmployee;
    const finalProductId = productId || idProduct;
    const finalDescription = description || comment;

    title = title?.trim();
    const cleanDescription = finalDescription?.trim();

    if (!finalCustomerId || !finalProductId || rating === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: "Rating must be a number between 1 and 5" });
    }

    const review = new productReviewModel({
      customerId: finalCustomerId,
      productId: finalProductId,
      title,
      rating: numRating,
      description: cleanDescription,
      status,
    });

    await review.save();
    return res.status(201).json({ message: "Review saved" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Eliminar reviews
productsReviewController.deleteReviews = async (req, res) => {
  try {
    const deletedReview = await productReviewModel.findByIdAndDelete(req.params.id);
    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }
    return res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Actualizar reviews
productsReviewController.updateReviews = async (req, res) => {
  try {
    let {
      customerId,
      idEmployee,
      productId,
      idProduct,
      title,
      rating,
      description,
      comment,
      status,
    } = req.body;

    const finalCustomerId = customerId || idEmployee;
    const finalProductId = productId || idProduct;
    const finalDescription = description || comment;

    title = title?.trim();
    const cleanDescription = finalDescription?.trim();

    if (!finalCustomerId || !finalProductId || rating === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: "Rating must be a number between 1 and 5" });
    }

    const updatedReview = await productReviewModel.findByIdAndUpdate(
      req.params.id,
      {
        customerId: finalCustomerId,
        productId: finalProductId,
        title,
        rating: numRating,
        description: cleanDescription,
        status,
      },
      { new: true }
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
