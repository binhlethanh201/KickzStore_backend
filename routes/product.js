const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/search", productController.search);
router.get("/brands", productController.getBrands);
router.get("/categories", productController.getCategories);
router.get("/by-price", productController.getByPrice);
router.get("/by-quantity", productController.getByQuantity);
router.get("/by-color-count", productController.getByColorCount);
router.get("/", productController.getAll);
router.get("/:id", productController.getById);

module.exports = router;
