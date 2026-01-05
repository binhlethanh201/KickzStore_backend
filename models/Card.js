const mongoose = require("mongoose");
const schema = mongoose.Schema;

const CardSchema = new schema(
  {
    userId: { type: schema.Types.ObjectId, ref: "User", required: true },
    cardName: { type: String, required: true }, 
    cardNumber: { type: String, required: true, unique: true },
    cardHolderName: { type: String, required: true }, 
    expiryDate: { type: String, required: true },
    cvv: { type: String, required: true }, 
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Card", CardSchema, "cards");