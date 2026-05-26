const express = require("express");
const router = express.Router();
const controller = require("./menu.controller");
const { authenticateToken } = require("../../middleware/auth");

router.use(authenticateToken);
router.get("/", controller.getCategories);

module.exports = router;
