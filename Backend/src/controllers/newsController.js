import NewsModel from "../models/News.js";
import { v2 as cloudinary } from "cloudinary";

const newsController = {};


newsController.createNews = async (req, res) => {
  try {

    const {
      title,
      subtitle,
      description,
      category,
      releaseDate,
      isFeatured,
      relatedProducts,
      createdBy
    } = req.body;

    const news = new NewsModel({
      title,
      subtitle,
      description,

      bannerImage: req.files.banner[0].path,
      public_idBanner: req.files.banner[0].filename,

      cardImage: req.files.card[0].path,
      public_idCard: req.files.card[0].filename,

      category,
      releaseDate,
      isFeatured,
      relatedProducts,
      createdBy
    });

    await news.save();

    res.status(201).json({
      success: true,
      message: "Novedad creada correctamente",
      data: news
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error al crear la novedad",
      error: error.message
    });

  }
};

newsController.getAllNews = async (req, res) => {
  try {
    const news = await NewsModel.find()
      .populate("createdBy", "name email")
      .populate("relatedProducts")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: news.length,
      data: news,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error al obtener novedades",
      error: error.message,
    });
  }
};


newsController.getNewsById = async (req, res) => {
  try {
    const news = await NewsModel.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("relatedProducts");

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "Novedad no encontrada",
      });
    }

    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error al obtener la novedad",
      error: error.message,
    });
  }
};


newsController.updateNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    const newsFound = await NewsModel.findById(newsId);
    if (!newsFound) {
      return res.status(404).json({
        success: false,
        message: "Novedad no encontrada",
      });
    }

    const updateData = { ...req.body };

    // Manejar carga de archivos desde Multer/Cloudinary
    if (req.files) {
      if (req.files.banner && req.files.banner[0]) {
        // Eliminar banner antiguo
        if (newsFound.public_idBanner) {
          await cloudinary.uploader.destroy(newsFound.public_idBanner);
        }
        updateData.bannerImage = req.files.banner[0].path;
        updateData.public_idBanner = req.files.banner[0].filename;
      }
      if (req.files.card && req.files.card[0]) {
        // Eliminar card antigua
        if (newsFound.public_idCard) {
          await cloudinary.uploader.destroy(newsFound.public_idCard);
        }
        updateData.cardImage = req.files.card[0].path;
        updateData.public_idCard = req.files.card[0].filename;
      }
    }

    const updatedNews = await NewsModel.findByIdAndUpdate(
      newsId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Novedad actualizada correctamente",
      data: updatedNews,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error al actualizar la novedad",
      error: error.message,
    });
  }
};


newsController.deleteNews = async (req, res) => {
  try {
    const newsFound = await NewsModel.findById(req.params.id);
    if (!newsFound) {
      return res.status(404).json({
        success: false,
        message: "Novedad no encontrada",
      });
    }

    // Borrar imágenes de Cloudinary
    if (newsFound.public_idBanner) {
      await cloudinary.uploader.destroy(newsFound.public_idBanner);
    }
    if (newsFound.public_idCard) {
      await cloudinary.uploader.destroy(newsFound.public_idCard);
    }

    await NewsModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Novedad eliminada correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error al eliminar la novedad",
      error: error.message,
    });
  }
};


newsController.getFeaturedNews = async (req, res) => {
  try {
    const featuredNews = await NewsModel.findOne({
      isFeatured: true,
      status: "published",
    })
      .populate("relatedProducts")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: featuredNews,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error al obtener la novedad destacada",
      error: error.message,
    });
  }
};


newsController.getRecentCollaborations = async (req, res) => {
  try {
    const collaborations = await NewsModel.find({
      category: "collaboration",
      status: "published",
    })
      .sort({ createdAt: -1 })
      .limit(2);

    res.status(200).json({
      success: true,
      total: collaborations.length,
      data: collaborations,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error al obtener colaboraciones recientes",
      error: error.message,
    });
  }
};


newsController.getUpcomingReleases = async (req, res) => {
  try {
    const today = new Date();

    const releases = await NewsModel.find({
      releaseDate: {
        $gte: today,
      },
      status: "published",
    })
      .sort({ releaseDate: 1 })
      .limit(8);

    res.status(200).json({
      success: true,
      total: releases.length,
      data: releases,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error al obtener próximos lanzamientos",
      error: error.message,
    });
  }
};


newsController.changeStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatus = ["draft", "published", "archived"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Estado inválido",
      });
    }

    const news = await NewsModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "Novedad no encontrada",
      });
    }

    res.status(200).json({
      success: true,
      message: "Estado actualizado correctamente",
      data: news,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error al cambiar estado",
      error: error.message,
    });
  }
};

export default newsController;