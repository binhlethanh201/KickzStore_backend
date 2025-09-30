const express = require('express')
const router = express.Router()
const wishListController = require('../controllers/wishListController')
router.get('/', wishListController.getAll)
module.exports = router