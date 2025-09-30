const Product = require('../models/Product')
class ProductController{
    async getAll(req, res, next) {
        try {
            const products = await Product.find()
            res.status(200).json(products)
        } catch (err) {
            res.status(500).json({ message: 'Error', error: err.message })
        }
    }
}
module.exports = new ProductController()