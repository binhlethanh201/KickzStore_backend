const Cart = require('../models/Cart')
class CartController{
    async getAll(req, res, next) {
        try {
            const carts = await Cart.find()
            res.status(200).json(carts)
        } catch (err) {
            res.status(500).json({ message: 'Error', error: err.message })
        }
    }
}
module.exports = new CartController()