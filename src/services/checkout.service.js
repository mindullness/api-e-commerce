'use strict'

const { BadRequestError } = require("../core/error.response")
const { findCartById } = require("../models/repositories/cart.repo")
const { checkProductByServer } = require("../models/repositories/product.repo")
const { getDiscountAmount } = require("./discount.service")

class CheckoutService {
    // login and without login
    /* payload:
        {
            cartId, // check exist
            userId, // check exist
            shop_order_ids: [
                {
                    shopId,
                    shop_discounts: [],
                    item_products: [
                        {
                            price,
                            quantity,
                            productId
                        }
                    ]
                },
                {
                    shopId,
                    shop_discounts: [
                        {
                            "shopId",
                            "discountId",
                            "codeId"
                        }
                    ],
                    item_products: [
                        {
                            price,
                            quantity,
                            productId
                        }
                    ]
                }
            ]
        }
    */
    static async checkoutReview({
        cartId, userId, shop_order_ids = []
    }) {
        // check cartId
        const foundCart = await findCartById(cartId)
        if (!foundCart) throw new BadRequestError('Cart does not exist!')

        const checkout_order = {
            totalPrice: 0,
            feeShip: 0,
            totalDiscount: 0,
            totalCheckout: 0
        }, shop_order_ids_new = []

        // 
        for (let i = 0; i < shop_order_ids.length; i++) {
            const { shopId, shop_discounts = [], item_products = [] } = shop_order_ids[i]
            // check product available
            const checkProductServer = await checkProductByServer(item_products)
            console.log(`checkProductByServer::: `, checkProductServer)
            if (!checkProductServer[0]) throw new BadRequestError('order wrong!!!')
            // Total price
            const checkoutPrice = await checkProductServer.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            }, 0)
            // Total price pre-handle
            checkout_order.totalPrice += checkoutPrice

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice,
                priceAppliedDiscount: checkoutPrice,
                item_products: checkProductServer
            }

            // Nếu shop_discounts tồn tại > 0, check xem có hợp lệ hay ko
            if (shop_discounts.length > 0) {
                // assume only 1 discount
                // get discount amount 
                const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    userId,
                    shopId,
                    products: checkProductServer
                })
                // Total discount amount
                checkout_order.totalDiscount += discount

                if(discount > 0) {
                    itemCheckout.priceAppliedDiscount = checkoutPrice - discount
                }
            }
            // Total final checkout price
            checkout_order.totalCheckout += itemCheckout.priceAppliedDiscount
            shop_order_ids_new.push(itemCheckout)
        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order
        }
    }
}

module.exports = CheckoutService