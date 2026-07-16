import orderModel from "../models/order.js";
import cartModel from "../models/cart.js";
import "../models/customer.js";
import "../models/product.js";

// nodemon trigger 2
const ordersController = {};

ordersController.getOrders = async (req, res) => {
  try {
    const orders = await orderModel.find().populate({
      path: "shopping_cart_id",
      populate: [
        {
          path: "customer_id",
          select: "name email",
        },
        {
          path: "items.product_id",
          select: "name price variants",
        },
      ],
    });
    return res.status(200).json(orders);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

ordersController.getOrderById = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id).populate({
      path: "shopping_cart_id",
      populate: [
        {
          path: "customer_id",
          select: "name email",
        },
        {
          path: "items.product_id",
          select: "name price variants",
        },
      ],
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json(order);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

ordersController.getMyOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find()
      .populate({
        path: "shopping_cart_id",
        populate: {
          path: "items.product_id",
          select: "name price variants",
        },
      })
      .sort({ ordered_at: -1 });

    const myOrders = orders.filter(
      (order) =>
        order.shopping_cart_id?.customer_id?.toString() ===
        req.user._id.toString(),
    );

    return res.status(200).json(myOrders);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

ordersController.insertOrder = async (req, res) => {
  try {
    let {
      shopping_cart_id,
      payment_method,
      payment_status,
      order_status,
      tracking_number,
      delivery_address,
      total_amount,
      shipment,
      delivery_date,
    } = req.body;

    payment_method = payment_method?.trim();
    tracking_number = tracking_number?.trim();
    delivery_address = delivery_address?.trim();

    if (!shopping_cart_id || !payment_method || total_amount === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const order = new orderModel({
      shopping_cart_id,
      payment_method,
      payment_status,
      order_status,
      tracking_number,
      delivery_address,
      total_amount,
      shipment,
      delivery_date,
    });

    await order.save();

    // Marcar el carrito como inactivo (ya no es el "carrito en progreso"),
    // pero SIN borrarlo, porque la orden sigue apuntando a este documento.
    await cartModel.findByIdAndUpdate(shopping_cart_id, { status: false });

    return res.status(201).json({ message: "Order saved", order });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

ordersController.deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await orderModel.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json({ message: "Order deleted" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

ordersController.updateOrder = async (req, res) => {
  try {
    let {
      shopping_cart_id,
      payment_method,
      payment_status,
      order_status,
      tracking_number,
      delivery_address,
      total_amount,
      shipment,
      delivery_date,
    } = req.body;

    payment_method = payment_method?.trim();
    tracking_number = tracking_number?.trim();
    delivery_address = delivery_address?.trim();

    if (!shopping_cart_id || !payment_method || total_amount === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      req.params.id,
      {
        shopping_cart_id,
        payment_method,
        payment_status,
        order_status,
        tracking_number,
        delivery_address,
        total_amount,
        shipment,
        delivery_date,
      },
      { new: true },
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ message: "Order updated" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default ordersController;
