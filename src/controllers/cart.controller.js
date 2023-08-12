'use strict'

const { SuccessResponse } = require("../core/success.response")
const CartService = require("../services/cart.service")

class CartController {

    /**
     * @desc add to cart for user
     * @param {int} userId
     * @param {*} res
     * @param {*} next
     * @method POST
     * @url /v1/api/cart/user
     * @returns {
     * }
     */
    addToCart = async (req, res, next) => {
        // new
        new SuccessResponse({
            message: 'Create new Cart successfully',
            metadata: await CartService.addToCart(req.body)
        }).send(res)
    }
    // update + -
    updateCart = async (req, res, next) => {
        // new
        new SuccessResponse({
            message: 'Update Cart successfully',
            metadata: await CartService.updateCart(req.body)
        }).send(res)
    }

    deleteCartItem = async (req, res, next) => {
        // new
        new SuccessResponse({
            message: 'Delete Cart successfully',
            metadata: await CartService.deleteCartItem(req.body)
        }).send(res)
    }

    listToCart = async (req, res, next) => {
        // console.log(req.query)
        new SuccessResponse({
            message: 'List Cart successfully',
            metadata: await CartService.getListUserCart(req.query)
        }).send(res)
    }
}

module.exports = new CartController()
