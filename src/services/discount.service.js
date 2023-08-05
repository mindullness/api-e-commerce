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
            max_value, max_uses, usage_count, max_usage_per_user
        } = payload

        // Check | validate
        const today = new Date()
        const startDate = new Date(start_date)
        const endDate = new Date(end_date)
        if (today < startDate) throw new BadRequestError('Invalid start date!')
        if (today > endDate) throw new BadRequestError('Invalid end date!')
        if (startDate >= endDate) throw new BadRequestError('Start date must be before end date!')
        // create index for discount code
        const foundDiscount = await findDiscount(code, shopId)

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
            discount_shopId: shopId,

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
    static async getProductsByDiscountCode({
        code, shopId, userId, limit, page
    }) {
        // Check discount in db
        const foundDiscount = await findDiscount(code, shopId)
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
}

async function findDiscount(code, shopId) {
    return await discount.findOne({
        discount_code: code,
        discount_shopId: converToObjectIdMongodb(shopId)
    }).lean()
}
