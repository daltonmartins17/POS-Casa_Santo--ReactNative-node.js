const express = require("express");
const cors = require("cors");
const authRoutes = require("./modules/auth/auth.routes");
const tablesRoutes = require("./modules/tables/tables.routes");
const menuRoutes = require("./modules/menu/menu.routes");
const usersRoutes = require("./modules/users/users.routes");
const { errorHandler } = require("./utils/errors");

const app = express();

app.use(cors());
app.use(express.json());

// Middleware para injetar io
app.use((req, res, next) => {
  req.io = global.io;
  next();
});

// Log de cada pedido
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/tables", tablesRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/users", usersRoutes);

// A rota de orders é especial (precisa de io)
const ordersRoutes = require("./modules/orders/orders.routes");
app.use("/api/orders", ordersRoutes(global.io));

// Tratamento de erros
app.use(errorHandler);

console.log("✅ Aplicação configurada");
console.log(
  "📋 Rotas: /api/auth, /api/tables, /api/menu, /api/orders, /api/users",
);

module.exports = app;
