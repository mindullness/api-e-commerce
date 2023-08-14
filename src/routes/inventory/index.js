'use strict'

const express = require('express')
const inventoryController = require('../../controllers/inventory.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const router = express.Router() // <== This is function, not CONST
const { authentication } = require('../../auth/authUtils')

// Authentication //
router.use(authentication)
///////////////////
router.post('', asyncHandler(inventoryController.addStockToInventory))

module.exports = router
