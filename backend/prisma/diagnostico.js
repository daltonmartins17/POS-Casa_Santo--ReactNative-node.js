const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function diagnosticar() {
  try {
    const users = await prisma.user.findMany();
    console.log("Utilizadores encontrados:", users.length);

    for (const user of users) {
      console.log(`\nEmail: ${user.email}`);
      console.log(`Password hash: ${user.password.substring(0, 30)}...`);

      const isValid = await bcrypt.compare("123456", user.password);
      console.log(`Password "123456" válida? ${isValid}`);
    }
  } catch (error) {
    console.error("Erro:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

diagnosticar();
