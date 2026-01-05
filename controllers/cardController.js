const Card = require("../models/Card");

class CardController {
  async getMyCards(req, res) {
    try {
      const userId = req.user.id;
      const cards = await Card.find({ userId }).sort({ createdAt: -1 });
      res.status(200).json(cards);
    } catch (err) {
      res.status(500).json({ message: "Error fetching cards", error: err.message });
    }
  }

  async addCard(req, res) {
    try {
      const userId = req.user.id;
      const { cardName, cardNumber, cardHolderName, expiryDate, cvv } = req.body;

      const existingCard = await Card.findOne({ cardNumber });
      if (existingCard) {
        return res.status(400).json({ message: "Card number already exists" });
      }

      const newCard = new Card({
        userId,
        cardName,
        cardNumber,
        cardHolderName,
        expiryDate,
        cvv,
        balance: 10000,
      });

      await newCard.save();
      res.status(201).json({ message: "Card added successfully", card: newCard });
    } catch (err) {
      res.status(500).json({ message: "Error adding card", error: err.message });
    }
  }

  async deleteCard(req, res) {
    try {
      const userId = req.user.id;
      const { cardId } = req.params;
      const deletedCard = await Card.findOneAndDelete({ _id: cardId, userId });

      if (!deletedCard) {
        return res.status(404).json({ message: "Card not found or unauthorized" });
      }
      res.status(200).json({ message: "Card deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Error deleting card", error: err.message });
    }
  }
}

module.exports = new CardController();