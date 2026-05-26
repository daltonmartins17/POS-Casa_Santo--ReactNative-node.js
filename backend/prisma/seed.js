const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 A verificar/atualizar base de dados...");

  // ─── Utilizadores (upsert: atualiza se existir, cria se não) ───
  const hashedPassword = await bcrypt.hash("123456", 10);

  const users = [
    {
      name: "Admin",
      email: "admin@casasanto.pt",
      password: hashedPassword,
      role: "ADMIN",
    },
    {
      name: "Gerente",
      email: "gerente@casasanto.pt",
      password: hashedPassword,
      role: "MANAGER",
    },
    {
      name: "Cozinheiro",
      email: "cozinha@casasanto.pt",
      password: hashedPassword,
      role: "CHEF",
    },
    {
      name: "Empregado 1",
      email: "empregado1@casasanto.pt",
      password: hashedPassword,
      role: "WAITER",
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, password: user.password, role: user.role },
      create: user,
    });
  }
  console.log("✅ Utilizadores verificados/atualizados.");

  // ─── Mesas (cria apenas se não existirem) ───
  const tableCount = await prisma.restaurantTable.count();

  if (tableCount === 0) {
    console.log("📦 A criar mesas...");
    for (let i = 1; i <= 12; i++) {
      await prisma.restaurantTable.create({
        data: { number: i, capacity: i > 8 ? 6 : 4 },
      });
    }
    console.log("✅ 12 mesas criadas.");
  } else {
    console.log(`ℹ️ ${tableCount} mesas já existem — manter como está.`);
  }

  // ─── Categorias e produtos (cria apenas se não existirem) ───
  const categoryCount = await prisma.productCategory.count();

  if (categoryCount === 0) {
    console.log("📦 A criar categorias e produtos...");

    const categories = await Promise.all([
      prisma.productCategory.create({ data: { name: "Mariscos" } }),
      prisma.productCategory.create({ data: { name: "Petiscos" } }),
      prisma.productCategory.create({ data: { name: "Bebidas" } }),
      prisma.productCategory.create({ data: { name: "Sobremesas" } }),
    ]);

    const [mariscos, petiscos, bebidas, sobremesas] = categories;

    await prisma.product.createMany({
      data: [
        {
          name: "Ameijoas à Bulhão Pato",
          price: 18.5,
          categoryId: mariscos.id,
        },
        { name: "Berbigão", price: 14.0, categoryId: mariscos.id },
        { name: "Lingueirão", price: 16.0, categoryId: mariscos.id },
        { name: "Camarão da Costa", price: 22.0, categoryId: mariscos.id },
        { name: "Sapateira Recheada", price: 25.0, categoryId: mariscos.id },
        { name: "Percebes", price: 35.0, categoryId: mariscos.id },
        { name: "Tremoços", price: 3.0, categoryId: petiscos.id },
        { name: "Pica-Pau", price: 9.5, categoryId: petiscos.id },
        { name: "Salada de Polvo", price: 12.0, categoryId: petiscos.id },
        { name: "Cerveja", price: 2.5, categoryId: bebidas.id },
        { name: "Vinho da Casa (jarro)", price: 8.0, categoryId: bebidas.id },
        { name: "Água Mineral", price: 1.5, categoryId: bebidas.id },
        { name: "Arroz Doce", price: 4.5, categoryId: sobremesas.id },
        { name: "Bolo de Bolacha", price: 5.0, categoryId: sobremesas.id },
      ],
    });
    console.log("✅ Categorias e produtos criados.");
  } else {
    console.log(
      `ℹ️ ${categoryCount} categorias já existem — manter como está.`,
    );
  }

  console.log("🎉 Base de dados pronta a usar!");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
