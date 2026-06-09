import productModel from "../models/product.js";
import { v2 as cloudinary } from "cloudinary";

const productController = {};

// Obtener productos
productController.getProducts = async (req, res) => {
  try {
    const products = await productModel.find();
    return res.status(200).json(products);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Insertar productos
productController.insertProducts = async (req, res) => {
  try {
    const {
      name,
      brand,
      gender,
      category,
      product_type,
      sport,
      description,
      price,
      discount,
      featured,
      active,
    } = req.body;

    if (!name || !brand || !gender || !category || !product_type || !price) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    let variants = [];

    if (req.body.variants) {
      variants = JSON.parse(req.body.variants);
    }

    if (req.files && req.files.length > 0) {
      variants = variants.map((variant, index) => {
        const file = req.files[index];

        return {
          ...variant,
          images: file
            ? [
                {
                  url: file.path,
                  public_id: file.filename,
                },
              ]
            : [],
        };
      });
    }

    const product = new productModel({
      name: name.trim(),
      brand: brand.trim(),
      gender: gender.trim(),
      category: category.trim(),
      product_type: product_type.trim(),
      sport: sport?.trim(),
      description: description?.trim(),
      price: Number(price),
      discount: Number(discount) || 0,

      featured: featured === "true",
      active: active !== "false",

      variants,
    });

    await product.save();

    return res.status(201).json({
      message: "Product saved successfully",
      product,
    });
  } catch (error) {
    console.error("ERROR COMPLETO:");
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// Eliminar productos
productController.deleteProducts = async (req, res) => {
  try {
    const productFound = await productModel.findById(req.params.id);

    if (!productFound) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    for (const variant of productFound.variants) {
      for (const image of variant.images) {
        if (image.public_id) {
          await cloudinary.uploader.destroy(image.public_id);
        }
      }
    }

    await productModel.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Actualizar productos
productController.updateProducts = async (req, res) => {
  try {
    const productFound = await productModel.findById(req.params.id);

    if (!productFound) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const {
      name,
      brand,
      gender,
      category,
      product_type,
      sport,
      description,
      price,
      discount,
      featured,
      active,
      variants,
    } = req.body;

    const updatedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      {
        name: name?.trim(),
        brand: brand?.trim(),
        gender: gender?.trim(),
        category: category?.trim(),
        product_type: product_type?.trim(),
        sport: sport?.trim(),
        description: description?.trim(),
        price: Number(price),
        discount: Number(discount) || 0,

        featured:
          featured !== undefined ? featured === "true" : productFound.featured,

        active: active !== undefined ? active === "true" : productFound.active,

        variants: variants ? JSON.parse(variants) : productFound.variants,
      },
      {
        new: true,
      },
    );

    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

productController.updateVariantImage = async (req, res) => {
  try {
    const { id, color } = req.params;

    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const variant = product.variants.find(
      (v) => v.color.toLowerCase() === color.toLowerCase(),
    );

    if (!variant) {
      return res.status(404).json({
        message: "Variant not found",
      });
    }

    // Eliminar imágenes antiguas
    for (const image of variant.images) {
      if (image.public_id) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }

    // Guardar nueva imagen
    variant.images = [
      {
        url: req.file.path,
        public_id: req.file.filename,
      },
    ];

    await product.save();

    return res.status(200).json({
      message: "Variant image updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
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
      return res
        .status(400)
        .json({ message: "Missing product name search term" });
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
      return res
        .status(400)
        .json({ message: "Missing min or max price range" });
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

productController.getFeaturedProducts = async (req, res) => {
  try {
    const products = await productModel.find({
      featured: true,
      active: true,
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export default productController;
