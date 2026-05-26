const express = require("express");
const router = express.Router();
const controller = require("./users.controller");
const { authenticateToken, authorizeRoles } = require("../../middleware/auth");

router.use(authenticateToken);
router.get("/", authorizeRoles("ADMIN", "MANAGER"), controller.getAll);
router.post("/", authorizeRoles("ADMIN", "MANAGER"), controller.create);
router.put("/:id", authorizeRoles("ADMIN", "MANAGER"), controller.update);
router.delete("/:id", authorizeRoles("ADMIN"), controller.remove);

module.exports = router;
