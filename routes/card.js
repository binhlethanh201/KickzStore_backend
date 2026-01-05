const express = require("express");
const router = express.Router();
const cardController = require("../controllers/cardController");
const verifyToken = require("../middlewares/auth");

router.get("/", verifyToken, cardController.getMyCards);
router.post("/", verifyToken, cardController.addCard);
router.delete("/:cardId", verifyToken, cardController.deleteCard);

module.exports = router;