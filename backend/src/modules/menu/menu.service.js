const prisma = require("../../config/database");

async function getCategoriesWithProducts() {
  try {
    const categories = await prisma.productCategory.findMany({
      include: {
        products: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
    console.log(
      `📋 Categorias: ${categories.length}, Produtos: ${categories.reduce((sum, cat) => sum + cat.products.length, 0)}`,
    );
    return categories;
  } catch (error) {
    console.error("❌ Erro ao buscar categorias:", error);
    throw error;
  }
}

module.exports = { getCategoriesWithProducts };
