'use strict'

const express = require('express')
const cartController = require('../../controllers/cart.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const router = express.Router() // <== This is function, not CONST
const { authentication } = require('../../auth/authUtils')

router.post('/add', asyncHandler(cartController.addToCart))
router.post('/update', asyncHandler(cartController.updateCart))
router.delete('/delete', asyncHandler(cartController.deleteCartItem))
router.get('/', asyncHandler(cartController.listToCart))

module.exports = router
