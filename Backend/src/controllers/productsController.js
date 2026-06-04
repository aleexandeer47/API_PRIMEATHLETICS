import productModel from "../models/product.js";

const productController = {};

// Obtener productos
productController.getProducts = async (req, res) => {
  try {
    const products = await productModel.find();
    return res.status(200).json(products);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Insertar productos
productController.insertProducts = async (req, res) => {
  try {
    let {
      name,
      brand,
      gender,
      category,
      productType,
      size,
      description,
      image,
      price,
      discount,
      amount,
      stock,
    } = req.body;

    name = name?.trim();
    brand = brand?.trim();
    gender = gender?.trim();
    category = category?.trim();
    productType = productType?.trim();
    size = size?.trim();
    description = description?.trim();
    image = image?.trim();
    discount = discount?.trim();

    const finalAmount = amount !== undefined ? amount : stock;

    if (!name || price === undefined || finalAmount === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (name.length < 3) {
      return res.status(400).json({ message: "Name too short" });
    }

    const product = new productModel({
      name,
      brand,
      gender,
      category,
      productType,
      size,
      description,
      image,
      price,
      discount,
      amount: finalAmount,
    });

    await product.save();
    return res.status(201).json({ message: "Product saved" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Eliminar productos
productController.deleteProducts = async (req, res) => {
  try {
    const deletedProduct = await productModel.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Actualizar productos
productController.updateProducts = async (req, res) => {
  try {
    let {
      name,
      brand,
      gender,
      category,
      productType,
      size,
      description,
      image,
      price,
      discount,
      amount,
      stock,
    } = req.body;

    name = name?.trim();
    brand = brand?.trim();
    gender = gender?.trim();
    category = category?.trim();
    productType = productType?.trim();
    size = size?.trim();
    description = description?.trim();
    image = image?.trim();
    discount = discount?.trim();

    const finalAmount = amount !== undefined ? amount : stock;

    if (!name || price === undefined || finalAmount === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (name.length < 3) {
      return res.status(400).json({ message: "Name too short" });
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      {
        name,
        brand,
        gender,
        category,
        productType,
        size,
        description,
        image,
        price,
        discount,
        amount: finalAmount,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ message: "Product updated" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Obtener por ID
productController.getProductById = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json(product);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Obtener por nombre
productController.getProductByName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Missing product name search term" });
    }
    const products = await productModel.find({
      name: { $regex: name.trim(), $options: "i" },
    });
    return res.status(200).json(products);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Productos con stock bajo
productController.getLowStock = async (req, res) => {
  try {
    const products = await productModel.find({ amount: { $lt: 5 } });
    return res.status(200).json(products);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Filtro por rango de precio
productController.getProductsByPriceRange = async (req, res) => {
  try {
    const { min, max } = req.body;
    if (min === undefined || max === undefined) {
      return res.status(400).json({ message: "Missing min or max price range" });
    }
    const products = await productModel.find({
      price: { $gte: Number(min), $lte: Number(max) },
    });
    return res.status(200).json(products);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Contar elementos en la colección
productController.countProducts = async (req, res) => {
  try {
    const count = await productModel.countDocuments();
    return res.status(200).json({ count });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default productController;