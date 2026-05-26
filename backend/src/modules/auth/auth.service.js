const prisma = require("../../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw { status: 401, message: "Credenciais inválidas" };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw { status: 401, message: "Credenciais inválidas" };

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "12h" },
  );

  return { token, user: { id: user.id, name: user.name, role: user.role } };
}

module.exports = { login };
