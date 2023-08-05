'use strict'

const { model, Schema, Types } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Discount'
const COLLECTION_NAME = 'Discounts'

// Declare the Schema of the Mongo model
const discountSchema = new Schema({
    discount_name: { type: String, require: true },
    discount_description: { type: String, require: true },
    discount_type: { type: String, default: 'fixed_amount' }, // percentage
    discount_value: { type: Number, require: true }, // fixed: 10.000, percent: 10%
    // INDEX: true for DISCOUNT_CODE
    discount_code: { type: String, require: true, index: true }, // discountCode
    discount_start_date: { type: Date, require: true },
    discount_end_date: { type: Date, require: true },
    discount_max_uses: { type: Number, require: true }, // Số lần discount đc sử dụng TỐI ĐA
    discount_usage_count: { type: Number, require: true }, // Số lần discount đã đc sử dụng
    discount_users_used: { type: Array, default: [] }, // Ai đã sử dụng
    discount_max_usage_per_user: { type: Number, require: true }, // Số lần tối đa mỗi User đc sử dụng
    discount_min_order_value: { type: Number, require: true },
    discount_shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },

    discount_is_active: { type: Boolean, default: true },
    discount_applies_to: { type: String, require: true, enum: ['all', 'specific'] },
    discount_product_ids: { type: Array, default: [] } // Số sp đc áp dụng
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

// create index for discount_code
// discountSchema.index({ discount_code: 1 })

//Export the model
module.exports = { discount: model(DOCUMENT_NAME, discountSchema) };
