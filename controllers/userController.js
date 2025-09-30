const User = require('../models/User')
class UserController{
     async getAll(req, res, next) {
        try {
            const users = await User.find()
            res.status(200).json(users)
        } catch (err) {
            res.status(500).json({ message: 'Error', error: err.message })
        }
    }
}
module.exports = new UserController()