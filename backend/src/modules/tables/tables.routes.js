const express = require("express");
const router = express.Router();
const controller = require("./tables.controller");
const { authenticateToken, authorizeRoles } = require("../../middleware/auth");

router.use(authenticateToken);

// Rotas para todos os funcionários autenticados
router.get("/", controller.getAll);
router.patch("/:id/status", controller.updateStatus);

// Rota para ver pedidos de uma mesa (qualquer funcionário)
router.get("/:id/orders", controller.getTableOrders);

// Rotas apenas para ADMIN e MANAGER
router.post("/", authorizeRoles("ADMIN", "MANAGER"), controller.create);
router.put("/:id", authorizeRoles("ADMIN", "MANAGER"), controller.update);
router.delete("/:id", authorizeRoles("ADMIN", "MANAGER"), controller.remove);

module.exports = router;
