const express = require("express");
const controller = require("./orders.controller");
const { authenticateToken, authorizeRoles } = require("../../middleware/auth");

module.exports = (io) => {
  const router = express.Router();

  router.use(authenticateToken);

  router.post("/", (req, res, next) => {
    req.io = io;
    controller.create(req, res, next);
  });

  router.get(
    "/kitchen",
    authorizeRoles("CHEF", "ADMIN", "MANAGER"),
    (req, res, next) => {
      req.io = io;
      controller.getKitchenOrders(req, res, next);
    },
  );

  router.patch(
    "/:id/status",
    authorizeRoles("CHEF", "ADMIN", "MANAGER"),
    (req, res, next) => {
      req.io = io;
      controller.updateOrderStatus(req, res, next);
    },
  );

  router.get("/table/:tableId", (req, res, next) => {
    req.io = io;
    controller.getByTable(req, res, next);
  });

  router.patch("/items/:id", (req, res, next) => {
    req.io = io;
    controller.updateOrderItem(req, res, next);
  });

  router.delete("/items/:id", (req, res, next) => {
    req.io = io;
    controller.deleteOrderItem(req, res, next);
  });

  router.post(
    "/products",
    authorizeRoles("ADMIN", "MANAGER"),
    (req, res, next) => {
      req.io = io;
      controller.createProduct(req, res, next);
    },
  );

  router.put(
    "/products/:id",
    authorizeRoles("ADMIN", "MANAGER"),
    (req, res, next) => {
      req.io = io;
      controller.updateProduct(req, res, next);
    },
  );

  router.delete(
    "/products/:id",
    authorizeRoles("ADMIN", "MANAGER"),
    (req, res, next) => {
      req.io = io;
      controller.deleteProduct(req, res, next);
    },
  );

  return router;
};
