const mongoose = require('mongoose')
const schema = mongoose.Schema
const CartSchema = new schema(
    {
      userId: {type: schema.Types.ObjectId, ref: 'User'},
      productId: {type: schema.Types.ObjectId, ref: 'Product'},
      itemQuantity: {type: Number}
    },
    { timestamps: true }
)
module.exports = mongoose.model('Cart', CartSchema, 'carts')