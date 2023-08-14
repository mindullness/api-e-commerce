'use strict'

const { BadRequestError } = require("../core/error.response")
const { inventory } = require("../models/inventory.model")
const { getProductById } = require("../models/repositories/product.repo")

class InventoryService {
    static async addStockToInventory({
        stock,
        productId,
        shopId,
        location = ' 123, Tran Phu street'
    }) {
        const product = await getProductById(productId)
        if (!product) throw new BadRequestError('The product does not exist')

        const query = { inven_shopId: shopId, inven_productId: productId },
            updateSet = {
                $inc: { inven_stock: stock },
                $set: { inven_location: location }
            },
            options = { upsert: true, new: true }

        return await inventory.findOneAndUpdate(query, updateSet, options)
    }
}

module.exports = InventoryService
