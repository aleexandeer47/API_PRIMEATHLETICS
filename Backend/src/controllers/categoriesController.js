import productsModel from "../models/product.js";

const productTypeLabels = {
  camiseta: "Camisetas",
  pants: "Pants",
  short: "Shorts",
  calcetas: "Calcetas",
  tenis: "Tenis",
  sandalias: "Sandalias",
};

const sportLabels = {
  training: "Training",
  gym: "Gym",
  running: "Running",
  basketball: "Basketball",
  football_turf: "Fútbol Turf",
  football_indoor: "Fútbol Indoor",
  volleyball: "Volleyball",
  crossfit: "Crossfit",
  trail_running: "Trail Running",
};

const categoriesController = {};

// Arma el menú dinámicamente a partir de los productos activos que existen
categoriesController.getMenu = async (req, res) => {
  try {
    const genders = ["hombres", "mujeres", "ninos"];
    const menu = {};

    for (const gender of genders) {
      // Incluye productos unisex dentro de cada género también
      const baseFilter = {
        active: true,
        $or: [{ gender }, { gender: "unisex" }],
      };

      const [ropaTypes, zapatosSports] = await Promise.all([
        productsModel.distinct("product_type", {
          ...baseFilter,
          category: "ropa",
        }),
        productsModel.distinct("sport", { ...baseFilter, category: "zapatos" }),
      ]);

      menu[gender] = {
        novedades: {
          label: "Novedades",
          links: [
            { label: "Nuevos ingresos", path: "/novedades" },
            { label: "Más vendidos", path: `/${gender}/mas-vendidos` },
            { label: "Ofertas", path: `/${gender}/ofertas` },
          ],
        },
        categorias: {
          label: "Categorías",
          links: [
            { label: "Ropa", path: `/${gender}/ropa` },
            { label: "Zapatos", path: `/${gender}/zapatos` },
          ],
        },
        ropa: {
          label: "Ropa",
          links: ropaTypes.map((type) => ({
            label: productTypeLabels[type] || type,
            path: `/${gender}/tipo/${type}`,
          })),
        },
        zapatos: {
          label: "Zapatos por deporte",
          links: zapatosSports.map((sport) => ({
            label: sportLabels[sport] || sport,
            path: `/${gender}/deporte/${sport}`,
          })),
        },
      };
    }

    return res.status(200).json(menu);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default categoriesController;
