const mongoose = require('mongoose')
const schema = mongoose.Schema
const WishListSchema = new schema(
    {
      userId: {type: schema.Types.ObjectId, ref: 'User'},
      productId: {type: schema.Types.ObjectId, ref: 'Product'},
    },
    { timestamps: true }
)
module.exports = mongoose.model('WishList', WishListSchema, 'wishLists')