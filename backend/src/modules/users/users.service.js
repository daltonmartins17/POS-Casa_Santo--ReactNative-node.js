const prisma = require("../../config/database");
const bcrypt = require("bcryptjs");

async function getAll() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });
}

async function create({ name, email, password, role, isActive }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw { status: 400, message: "Email já existe." };
  const hashed = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: role || "WAITER",
      isActive: isActive !== false,
    },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
}

async function update(id, data) {
  if (data.email) {
    const existing = await prisma.user.findFirst({
      where: { email: data.email, id: { not: id } },
    });
    if (existing) throw { status: 400, message: "Email já existe." };
  }

  const updateData = {};
  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email;
  if (data.role) updateData.role = data.role;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.password) updateData.password = await bcrypt.hash(data.password, 10);

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
}

async function remove(id) {
  // Verificar se é o último ADMIN
  const user = await prisma.user.findUnique({ where: { id } });
  if (user.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      throw {
        status: 400,
        message: "Não é possível remover o último Administrador do sistema.",
      };
    }
  }
  // Verificar se é o último MANAGER (só se quem remove for ADMIN pode remover o último MANAGER)
  return prisma.user.delete({ where: { id } });
}

module.exports = { getAll, create, update, remove };
