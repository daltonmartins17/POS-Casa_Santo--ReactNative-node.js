const menuService = require("./menu.service");

async function getCategories(req, res, next) {
  try {
    console.log("📞 Pedido GET /api/menu recebido");
    const categories = await menuService.getCategoriesWithProducts();
    console.log(`📋 Categorias encontradas: ${categories.length}`);
    res.json(categories);
  } catch (error) {
    console.error("❌ Erro em getCategories:", error);
    next(error);
  }
}

module.exports = { getCategories };
