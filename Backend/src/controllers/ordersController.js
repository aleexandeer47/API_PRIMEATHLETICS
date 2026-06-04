import orderModel from "../models/order.js";

const ordersController = {};

// Obtener órdenes
ordersController.getOrders = async (req, res) => {
  try {
    const orders = await orderModel.find();
    return res.status(200).json(orders);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Obtener orden por ID
ordersController.getOrderById = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json(order);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Insertar orden
ordersController.insertOrder = async (req, res) => {
  try {
    let {
      shoppingCartId,
      paymentMethod,
      paymentStatus,
      orderStatus,
      trackingNumber,
      deliveryAddress,
      totalAmount,
      shipment,
      deliveryDate,
    } = req.body;

    paymentMethod = paymentMethod?.trim();
    trackingNumber = trackingNumber?.trim();
    deliveryAddress = deliveryAddress?.trim();

    if (!shoppingCartId || !paymentMethod || totalAmount === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const order = new orderModel({
      shoppingCartId,
      paymentMethod,
      paymentStatus,
      orderStatus,
      trackingNumber,
      deliveryAddress,
      totalAmount,
      shipment,
      deliveryDate,
    });

    await order.save();
    return res.status(201).json({ message: "Order saved" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Eliminar orden
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

// Actualizar orden
ordersController.updateOrder = async (req, res) => {
  try {
    let {
      shoppingCartId,
      paymentMethod,
      paymentStatus,
      orderStatus,
      trackingNumber,
      deliveryAddress,
      totalAmount,
      shipment,
      deliveryDate,
    } = req.body;

    paymentMethod = paymentMethod?.trim();
    trackingNumber = trackingNumber?.trim();
    deliveryAddress = deliveryAddress?.trim();

    if (!shoppingCartId || !paymentMethod || totalAmount === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      req.params.id,
      {
        shoppingCartId,
        paymentMethod,
        paymentStatus,
        orderStatus,
        trackingNumber,
        deliveryAddress,
        totalAmount,
        shipment,
        deliveryDate,
      },
      { new: true }
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