'use strict'

const ProductFactory = require("../services/product.service")

const { OK, CREATED, SuccessResponse } = require('../core/success.response')

class ProductController {
    // create Product
    createProduct = async (req, res, next) => {

        new SuccessResponse({
            message: 'Created new Product successfully!',
            metadata: await ProductFactory.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }
    // update Product
    updateProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update Product successfully!',
            metadata: await ProductFactory.updateProduct(req.body.product_type, req.params.productId, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    // PATCH
    /**
     * @desc Publish a product by a seller
     * @method PATCH
     * @param 
     */
    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Publish Product successfully!',
            metadata: await ProductFactory.publishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id
            })
        }).send(res)
    }
    unPublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Unpublish Product successfully!',
            metadata: await ProductFactory.unPublishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id
            })
        }).send(res)
    }
    // END PATCH

    // QUERY //
    /**
     * @desc Get all Drafts for shp
     * @method GET
     * @param {Number} limit 
     * @param {Number} skip 
     * @return {JSON} 
     */
    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list of draft products successfully!',
            metadata: await ProductFactory.findAllDraftsForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }
    getAllPublishedForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list of published products successfully!',
            metadata: await ProductFactory.findAllPublishedForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }
    getListSearchProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list of search products successfully!',
            metadata: await ProductFactory.searchProduct(req.params)
        }).send(res)
    }
    findAllProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Find all products successfully!',
            metadata: await ProductFactory.findAllProducts(req.query)
        }).send(res)
    }
    findProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Find product by Id successfully!',
            metadata: await ProductFactory.findProduct({ product_id: req.params.product_id })
        }).send(res)
    }
    // END QUERY //
}

module.exports = new ProductController()
