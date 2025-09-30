const mongoose = require('mongoose')
const schema = mongoose.Schema
const ProductSchema = new schema(
    {
        brand: {type: String, required: true},
        description: {type: String},
        price: {type: Number, required: true},
        quantity: {type: Number, default: 0},
        imageUrl: {type: String}
    },
    { timestamps: true }
)
module.exports = mongoose.model('Product', ProductSchema, 'products')