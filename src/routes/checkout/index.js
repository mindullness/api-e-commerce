'use strict'

const express = require('express')
const checkoutController = require('../../controllers/checkout.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const router = express.Router() // <== This is function, not CONST
const { authentication } = require('../../auth/authUtils')

router.post('/review', asyncHandler(checkoutController.checkoutReview))

module.exports = router
