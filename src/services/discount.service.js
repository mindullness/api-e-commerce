'use strict'

/*
    ////////////////////////////
    DISCOUNT SERVICE
    1 - Generator Discount Code [Shop | Admin]
    2 - Get discount amount [User]
    3 - Get all discount codes [User | Shop]
    4 - Verify discount codes [User]
    5 - Delete discount Code [Shop | Admin]
    6 - Cancel discount Code [User]  
    7 - Get all products by discount code [User]
*/

const { discount } = require('../models/discount.model')
const { BadRequestError, NotFoundError } = require('../core/error.response')
const { converToObjectIdMongodb } = require('../utils')
const { findAllProducts } = require('../models/repositories/product.repo')
const { findAllDiscountCodesUnSelect } = require('../models/repositories/discount.repo')

class DiscountService {

    static async createDiscountCode(payload) {
        const { code, start_date, end_date, is_active, shopId, product_ids,
            min_order_value, applies_to, name, description, type, value,
            max_value, max_uses, usage_count, users_used, max_usage_per_user
        } = payload

        // Check | validate dates
        await validateDiscountDates(start_date, end_date)
        const startDate = new Date(start_date)
        const endDate = new Date(end_date)
        // create index for discount code
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: converToObjectIdMongodb(shopId)
        }).lean()

        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError('Discount existed!')
        }
        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_code: code,
            discount_start_date: startDate,
            discount_end_date: endDate,
            discount_max_uses: max_uses,
            discount_usage_count: usage_count,
            discount_users_used: users_used ?? [],
            discount_max_usage_per_user: max_usage_per_user,
            discount_min_order_value: min_order_value || 0,
            discount_shopId: converToObjectIdMongodb(shopId),

            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === 'all' ? [] : product_ids
        })

        return newDiscount
    }

    static async updateDiscountCode() {
        // ...
    }

    /*
        Get list of products by discount code
    */
    static async getProductsWithDiscountCode({
        code, shopId, userId, limit, page
    }) {
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: converToObjectIdMongodb(shopId)
        }).lean()

        if (!foundDiscount || !foundDiscount.discount_is_active) {
            throw new NotFoundError('Not found valid discount!')
        }

        const { discount_applies_to, discount_product_ids } = foundDiscount
        let products
        if (discount_applies_to === 'all') {
            // get all products
            products = await findAllProducts({
                filter: {
                    product_shop: converToObjectIdMongodb(shopId),
                    isPublished: true,
                },
                select: ['product_name'],
                limit: +limit,
                sort: 'ctime',
                page: +page,
            })
        }
        if (discount_applies_to === 'specific') {
            products = await findAllProducts({
                filter: {
                    // get products applies this discount
                    _id: { $in: discount_product_ids },
                    isPublished: true
                },
                select: ['product_name'],
                limit: +limit,
                sort: 'ctime',
                page: +page,
            })
        }
        return products
    }

    /*
        Get all discount codes by shopId [User | Shop]
    */
    static async getAllDiscountCodesByShop({ limit, page, shopId }) {
        return await findAllDiscountCodesUnSelect({
            limit: +limit, page: +page,
            filter: {
                discount_shopId: converToObjectIdMongodb(shopId),
                discount_is_active: true
            },
            unSelect: ['__v', 'discount_shopId'],
            model: discount
        })
    }

    /*
        Apply Discount Code
        products = [
            {
                productId,
                shopId,
                quantity,
                name,
                price
            },    
            {
                productId,
                shopId,
                quantity,
                name,
                price
            }    
        ]
    */
    static async getDiscountAmount({ codeId, userId, shopId, products }) {
        const foundDiscount = await discount.findOne({
            discount_code: codeId,
            discount_shopId: converToObjectIdMongodb(shopId)
        }).lean()
        if (!foundDiscount) throw new NotFoundError('Not found valid discount!')

        const {
            discount_is_active,
            discount_max_uses,
            discount_start_date,
            discount_end_date,
            discount_min_order_value,
            discount_max_usage_per_user,
            discount_users_used,
            discount_type,
            discount_value
        } = foundDiscount

        if (!discount_is_active) throw new NotFoundError('Discount is expired!')
        if (!discount_max_uses) throw new NotFoundError('Discount is out!')
        // Check | validate dates
        await validateDiscountDates({ start_date: discount_start_date, end_date: discount_end_date })
        // Check min value
        let totalOrder = 0;
        if (discount_min_order_value > 0) {
            // get total price
            totalOrder = products.reduce((acc, product) => acc + (product.quantity * product.price), 0)
            if (totalOrder < discount_min_order_value) {
                throw new NotFoundError(`Discount requires a minium order value of ${discount_min_order_value}!`)
            }
        }

        if (discount_max_usage_per_user > 0) {
            const userUsedDiscount = discount_users_used.find(user => user.userId === userId)
            if (userUsedDiscount) {
                // ...
            }
        }
        // Check whether discount is fixed_amount or percentage
        const amount = discount_type === 'fixed_amount' ? discount_value : totalOrder * (discount_value / 100)

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount
        }
    }

    static async deleteDiscountCode({ shopId, codeId }) {
        // Delete 1 voucher:
        // option 1: save into another db for recover later
        // option 2: mark a field is_deleted (not recommend)

        // now is delete directly in db (not recommend)
        // advance: check any case if discount is currently in use
        const deleted = await discount.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: converToObjectIdMongodb(shopId)
        })
        return deleted
    }
    /*
        Cancel Discount Code
    */
    static async cancelDiscountCode({ codeId, shopId, userId }) {
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: converToObjectIdMongodb(shopId)
        }).lean()
        if (!foundDiscount) throw new NotFoundError('Not found valid discount!')
        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: userId,
            },
            $inc: {
                discount_max_uses: 1,
                discount_usage_count: -1
            }
        })
        return result
    }
}
const validateDiscountDates = async (start_date, end_date) => {
    const today = new Date()
    const startDate = new Date(start_date)
    const endDate = new Date(end_date)
    if (today < startDate) throw new BadRequestError('Invalid start date!')
    if (today > endDate) throw new BadRequestError('Invalid end date!')
    if (startDate >= endDate) throw new BadRequestError('Start date must be before end date!')
}

module.exports = DiscountService