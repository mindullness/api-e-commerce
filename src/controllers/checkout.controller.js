'use strict'

const { SuccessResponse } = require("../core/success.response")
const CheckoutService = require("../services/checkout.service")

class CheckoutController {

    /**
     * @desc add to Checkout for user
     * @param {int} userId
     * @param {*} res
     * @param {*} next
     * @method POST
     * @url /v1/api/Checkout/user
     * @returns {
     * }
     */
    checkoutReview = async (req, res, next) => {
        // review checkout
        new SuccessResponse({
            message: 'Create new Checkout successfully',
            metadata: await CheckoutService.checkoutReview(req.body)
        }).send(res)
    }
}

module.exports = new CheckoutController()
