'use strict'

const { getSelectData, getUnSelectData, converToObjectIdMongodb } = require('../../utils')
const { product, electronic, clothing, furniture } = require('../product.model')
const { Types } = require('mongoose')

// FIND ALL DRAFT PRODUCTS
const findAllDraftsForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}
// FIND ALL PUBLISHED PRODUCTS
const findAllPublishedForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}
// SEARCH PRODUCT(S)
const searchProductByUser = async ({ keySearch }) => {
    const regexSearch = new RegExp(keySearch)
    const result = await product.find({
        isPublished: true,
        $text: { $search: regexSearch }
    }, {
        // score: từ đc tìm kiếm chính xác nhất
        score: { $meta: 'textScore' }
    }).sort({ score: { $meta: 'textScore' } }).lean()

    return result
}
// PUBLISH A PRODUCT
const publishProductByShop = async ({ product_shop, product_id }) => {
    const foundProduct = await product.findOne({
        product_shop: converToObjectIdMongodb(product_shop),
        _id: converToObjectIdMongodb(product_id)
    })
    if (!foundProduct) return null

    foundProduct.isDraft = false
    foundProduct.isPublished = true
    const { modifiedCount } = await foundProduct.updateOne(foundProduct).exec()

    return modifiedCount
}
// UNPUBLISH A PRODUCT
const unPublishProductByShop = async ({ product_shop, product_id }) => {
    const foundProduct = await product.findOne({
        product_shop: converToObjectIdMongodb(product_shop),
        _id: converToObjectIdMongodb(product_id)
    })
    if (!foundProduct) return null

    foundProduct.isDraft = true
    foundProduct.isPublished = false
    const { modifiedCount } = await foundProduct.updateOne(foundProduct).exec()

    return modifiedCount
}
// FIND ALL PRODUCTS
const findAllProducts = async ({ limit, sort, page, filter, select }) => {
    const skip = (page - 1) * limit;
    // sort: -1 = descending // 1: ascending
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const products = await product.find(filter)
        .sort(sortBy) // -1 || 1
        .skip(skip)
        .limit(limit)
        .select(getSelectData(select)) // { product_name: 1, product_thumb: 0}
        .lean()
        .exec()
    return products
}
// FIND PRODUCT BY ID
const findProduct = async ({ product_id, unselect }) => {
    return await product.findById(product_id).select(getUnSelectData(unselect)).lean().exec()
}

// UPDATE PRODUCT
const updateProductById = async ({
    productId,
    payload,
    model,
    isNew = true
}) => {
    // console.log(productId, payload, model)
    return await model.findByIdAndUpdate(productId, payload, { new: isNew }).exec()
}

const queryProduct = async ({ query, limit, skip }) => {
    // query: { product_shop, isDraft: true } || { product_shop, isPublished: true }
    return await product.find(query)
        .populate('product_shop', 'name email -_id') // lấy "name" và "email", ko lấy "_id"
        .sort({ updateAt: -1 }) // get latest - lấy mới nhất
        .skip(skip)
        .limit(limit)
        .lean() // to skip hydrating the result documents and return Plain Odd Javascript Object (POJO)
        .exec() // optional: to tell Mongoose that you're using async/await
}

// get product by productId
const getProductById = async (productId) => {
    return await product.findOne({ _id: converToObjectIdMongodb(productId) })
}

module.exports = {
    findAllDraftsForShop,
    findAllPublishedForShop,
    publishProductByShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById,
    getProductById
}

