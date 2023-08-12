'use strict'

const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'Cart'
const COLLECTION_NAME = 'Carts'

const cartSchema = new Schema({
    cart_state: {
        type: String, require: true,
        enum: ['active', 'completed', 'failed', 'pending'],
        default: 'active'
    },
    /*
        cart_products:
        [
            {
                productId,
                shopId,
                quantity,
                name, // not important due to recheck at server
                price // not important due to recheck at server
            }
        ]
    */
    cart_products: { type: Array, require: true, default: [] },
    cart_count_product: { type: Number, default: 0 },
    cart_userId: { type: Number, require: true }, // Both of Buyer (user) and Seller (shopId)
}, {
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    }
})
module.exports = { cart: model(DOCUMENT_NAME, cartSchema) }