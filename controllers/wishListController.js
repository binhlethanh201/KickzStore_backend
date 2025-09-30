const WishList = require('../models/WishList')
class wishListController{
       async getAll(req, res, next) {
             try {
                 const wishLists = await WishList.find()
                 res.status(200).json(wishLists)
             } catch (err) {
                 res.status(500).json({ message: 'Error', error: err.message })
             }
         }
}
module.exports = new wishListController()