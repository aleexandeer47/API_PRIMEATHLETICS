import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { config } from "../../src/config.js";

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudinary_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

// Subir imágenes
export const uploadImageTo = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `PrimeAthletics/${folderName}`,
      allowed_formats: ["jpg", "png", "jpeg", "webp", "svg"],
    },
  });

  return multer({ storage });
};

// Subir documentos
export const uploadFileTo = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `PrimeAthletics/${folderName}`,
      allowed_formats: ["pdf", "xlsx", "xls", "csv"],
    },
  });

  return multer({ storage });
};

// Subir imágenes y archivos al mismo tiempo
export const uploadPhotoAndFile = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const isPhoto = file.fieldname === "photos";

      return {
        folder: `PrimeAthletics/${folderName}/${isPhoto ? "photos" : "files"}`,
        allowed_formats: isPhoto
          ? ["jpg", "png", "jpeg", "webp", "svg"]
          : ["pdf", "xlsx", "xls", "csv"],
      };
    },
  });

  return multer({ storage });
};

export default cloudinary;
