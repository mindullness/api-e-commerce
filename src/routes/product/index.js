'use strict'

const express = require('express')
const productController = require('../../controllers/product.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const router = express.Router() // <== This is function, not CONST
const { authentication } = require('../../auth/authUtils')

// search
router.get('', asyncHandler(productController.findAllProducts))
router.get('/:product_id', asyncHandler(productController.findProduct))
router.get('/search/:keySearch', asyncHandler(productController.getListSearchProducts))

// Authentication //
router.use(authentication)
///////////////////
router.post('/create', asyncHandler(productController.createProduct))
router.patch('/update/:productId', asyncHandler(productController.updateProduct))
router.patch('/publish/:id', asyncHandler(productController.publishProductByShop))
router.patch('/unpublish/:id', asyncHandler(productController.unPublishProductByShop))

// QUERY
router.get('/drafts/all', asyncHandler(productController.getAllDraftsForShop))
router.get('/published/all', asyncHandler(productController.getAllPublishedForShop))

module.exports = router
