import cartModel from "../models/cart.js";
import productsModel from "../models/product.js";

const cartController = {};

// GET ALL
cartController.getAllCarts = async (req, res) => {
  try {
    const carts = await cartModel
      .find()
      .populate("customer_id")
      .populate("items.product_id");

    return res.status(200).json(carts);
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET BY ID
cartController.getCartById = async (req, res) => {
  try {
    const cart = await cartModel
      .findById(req.params.id)
      .populate("customer_id")
      .populate("items.product_id");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    return res.status(200).json(cart);
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// INSERT
cartController.insertCart = async (req, res) => {
  try {
    const customer_id = req.user._id;
    const { items, status } = req.body;

    if (!items?.length) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    let total_before_discount = 0;
    let total_savings = 0;
    let total_after_discount = 0;

    let newItems = [];

    for (let i = 0; i < items.length; i++) {
      const productFound = await productsModel.findById(items[i].product_id);

      if (!productFound) {
        return res.status(404).json({
          message: `Product ${items[i].product_id} not found`,
        });
      }

      const price = Number(productFound.price);

      const discount = parseFloat(productFound.discount?.replace("%", "")) || 0;

      const subtotal = price * items[i].quantity;

      const savings = subtotal * (discount / 100);

      const finalSubtotal = subtotal - savings;

      total_before_discount += subtotal;
      total_savings += savings;
      total_after_discount += finalSubtotal;

      newItems.push({
        product_id: items[i].product_id,
        quantity: items[i].quantity,
        subtotal: finalSubtotal,
      });
    }

    const newCart = new cartModel({
      customer_id,
      items: newItems,
      total_before_discount,
      total_savings,
      total_after_discount,
      status,
    });

    await newCart.save();

    return res.status(201).json({
      message: "Cart saved",
    });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE
cartController.updateCart = async (req, res) => {
  try {
    const existingCart = await cartModel.findById(req.params.id);

    if (!existingCart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    if (existingCart.customer_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "No puedes modificar este carrito",
      });
    }

    const { items, status } = req.body;

    if (!items?.length) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    let total_before_discount = 0;
    let total_savings = 0;
    let total_after_discount = 0;

    let newItems = [];

    for (let i = 0; i < items.length; i++) {
      const productFound = await productsModel.findById(items[i].product_id);

      if (!productFound) {
        return res.status(404).json({
          message: `Product ${items[i].product_id} not found`,
        });
      }

      const price = Number(productFound.price);

      const discount = parseFloat(productFound.discount?.replace("%", "")) || 0;

      const subtotal = price * items[i].quantity;

      const savings = subtotal * (discount / 100);

      const finalSubtotal = subtotal - savings;

      total_before_discount += subtotal;
      total_savings += savings;
      total_after_discount += finalSubtotal;

      newItems.push({
        product_id: items[i].product_id,
        quantity: items[i].quantity,
        subtotal: finalSubtotal,
      });
    }

    const updatedCart = await cartModel.findByIdAndUpdate(
      req.params.id,
      {
        items: newItems,
        total_before_discount,
        total_savings,
        total_after_discount,
        status,
      },
      { new: true },
    );

    return res.status(200).json({
      message: "Cart updated",
    });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE
cartController.deleteCart = async (req, res) => {
  try {
    const deletedCart = await cartModel.findByIdAndDelete(req.params.id);

    if (!deletedCart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    return res.status(200).json({
      message: "Cart deleted",
    });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default cartController;
