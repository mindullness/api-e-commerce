'use strict'

const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'

const orderSchema = new Schema({
    order_userId: { type: Number, require: true },
    /*
        order_checkout = {
            "totalPrice":,
            "totalAppliedDiscount":,
            "feeShip":
        }
    */
    order_checkout: { type: Object, default: {} },
    /*
        {
            "street": ,
            "city": ,
            "state": ,
            "country": 
        }
    */
    order_shipping: { type: Object, default: {} },
    order_payment: { type: Object, default: {} },
    order_products: { type: Array, require: true },
    order_trackingNumber: { type: String, default: '#00001108052023'},
    order_status: { type: String, enum: ['peding', 'confirmed', 'shipped', 'cancelled', 'delivered'], default: 'pending'}
}, {
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    }
})
module.exports = { order: model(DOCUMENT_NAME, orderSchema) }