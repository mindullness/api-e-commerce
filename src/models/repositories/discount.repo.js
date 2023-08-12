'use strict'

const { getUnSelectData, getSelectData } = require("../../utils");

const findAllDiscountCodesUnSelect = async ({
    limit = 50, page = 1, sort = 'ctime', filter, unSelect, model
}) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const documents = await model.find(filter)
        .sort(sortBy) // -1 || 1
        .skip(skip)
        .limit(limit)
        .select(getUnSelectData(unSelect)) // { product_name: 1, product_thumb: 0}
        .lean()
        .exec()
    return documents
}
const findAllDiscountCodesSelect = async ({
    limit = 50, page = 1, sort = 'ctime', filter, select, model
}) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const documents = await model.find(filter)
        .sort(sortBy) // -1 || 1
        .skip(skip)
        .limit(limit)
        .select(getSelectData(select)) // { product_name: 1, product_thumb: 0}
        .lean()
        .exec()
    return documents
}
// const checkDiscountExists = async ({ model, filter }) => {
//     return await model.findOne(filter).lean()
// }

module.exports = {
    findAllDiscountCodesSelect,
    findAllDiscountCodesUnSelect,
}