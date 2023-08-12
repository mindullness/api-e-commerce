'use strict'
/**
 * Implement Factory Pattern
 */

const { product, clothing, electronic, furniture, DOCUMENT_NAME } = require('../models/product.model')
const { BadRequestError } = require('../core/error.response')
const {
    findAllDraftsForShop,
    publishProductByShop,
    findAllPublishedForShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById
} = require('../models/repositories/product.repo')

const { updateNestedObjectParser } = require('../utils')
const { insertInventory } = require('../models/repositories/inventory.repo')

// define Factory class to create product
class ProductFactory {
    /* 
        type: 'Clothing', 'Electrnoics',
        payload
    */
    static productRegistry = {} // object chứa key và class
    /* 
        {
            'Clothing': { classRef: Clothing, modelRef: clothing },
            'Electronic': { classRef: Electronics, modelRef: electronic },
            'Furniture': { classRef: Furniture, modelRef: furniture }
        }
    */
    // init //
    static registerProductType(type, classRef, modelRef) {
        // Mỗi lần có 1 module mới thì ADD vào productRegistry
        ProductFactory.productRegistry[type] = { classRef, modelRef }
    }

    // createProduct //
    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type]?.classRef
        if (!productClass) throw new BadRequestError(`Invalid Product Types ${type}`)

        return new productClass(payload).createProduct()
    }

    // PATCH //
    static async updateProduct(type, productId, payload) {
        const productRef = ProductFactory.productRegistry[type]

        if (!productRef) throw new BadRequestError(`Invalid Product Types ${type}`)
        const validObject = updateNestedObjectParser(new productRef.classRef(payload))
        const attr = payload.product_attributes
        if (attr) {
            await updateProductById({ productId, payload: updateNestedObjectParser(attr), model: productRef.modelRef })
        }
        return await updateProductById({ productId, payload: validObject, model: product })
        // return new productClass(payload).updateProduct(productId)
    }
    /*
        Publish a product by a seller
    */
    static async publishProductByShop({ product_shop, product_id }) {
        return await publishProductByShop({ product_shop, product_id })
    }
    static async unPublishProductByShop({ product_shop, product_id }) {
        return await unPublishProductByShop({ product_shop, product_id })
    }
    // END PATCH //

    // QUERY //
    static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: true }
        return await findAllDraftsForShop({ query, limit, skip })
    }
    static async findAllPublishedForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isPublished: true }
        return await findAllPublishedForShop({ query, limit, skip })
    }
    static async searchProduct({ keySearch }) {
        return await searchProductByUser({ keySearch })
    }
    static async findAllProducts({ limit = 50, sort = 'ctime', page = 1, filter = { isPublished: true } }) {
        return await findAllProducts({
            limit, sort, filter, page,
            select: ['product_name', 'product_price', 'product_thumb', 'product_shop']
        })
    }
    static async findProduct({ product_id }) {
        return await findProduct({ product_id, unselect: ['__v'] })
    }
    // END QUERY //
}

// define base product class
class Product {
    constructor({
        product_name, product_thumb, product_description, product_price,
        product_quantity, product_type, product_shop, product_attributes
    }) {
        this.product_name = product_name;
        this.product_thumb = product_thumb;
        this.product_description = product_description;
        this.product_price = product_price;
        this.product_quantity = product_quantity;
        this.product_type = product_type;
        this.product_shop = product_shop;
        this.product_attributes = product_attributes;
    }

    // create new product
    async createProduct(productId) {
        const newProduct = await product.create({ ...this, _id: productId });
        if (newProduct) {
            // add newProduct into product_stock in inventory collection
            await insertInventory({
                productId: newProduct._id,
                shopId: this.product_shop,
                stock: this.product_quantity
            })
        }
        return newProduct
    }
    // update product
    // async updateProduct(productId, payload) {
    //     return await updateProductShared(productId, payload, product)
    // }
}

// define sub-class for different product types Clothing
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        // console.log('Clothing::: ', newClothing)
        if (!newClothing) throw new BadRequestError('Create new clothing error');

        const newProduct = await super.createProduct(newClothing._id)
        if (!newProduct) throw new BadRequestError('Create new clothing error');

        return newProduct;
    }

    // async updateProduct(productId) {
    //     /*
    //         {
    //             a: undefined
    //             b: null
    //         }
    //         */
    //     // 1. Remove all attr has null or undefined value
    //     const objectParams = updateNestedObjectParser(this)
    //     // 2. Check where to update: Child or Parent or Both
    //     if (objectParams.product_attributes) {
    //         // update child
    //         await updateProductShared(productId, objectParams, clothing)
    //     }
    //     const updatedProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams))
    //     return updatedProduct
    // }
}
class Electronics extends Product {
    async createProduct() {
        const newElectronics = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        if (!newElectronics) throw new BadRequestError('Create new electronics error');

        const newProduct = await super.createProduct(newElectronics._id);
        if (!newProduct) throw new BadRequestError('Create new electronics error');

        return newProduct;
    }
    // async updateProduct(productId) {
    //     const objectParams = this
    //     if (objectParams.product_attributes) {
    //         await updateProductShared(productId, objectParams.product_attributes, electronic)
    //     }
    //     const updatedProduct = await super.updateProduct(productId, objectParams)
    //     return updatedProduct
    // }
}
class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        if (!newFurniture) throw new BadRequestError('Create new electronics error');

        const newProduct = await super.createProduct(newFurniture._id);
        if (!newProduct) throw new BadRequestError('Create new electronics error');

        return newProduct;
    }

    // async updateProduct(productId) {
    //     const objectParams = updateNestedObjectParser(this)
    //     // console.log('NOT OBJECT:: ', objectParams)
    //     if (objectParams.product_attributes) {
    //         await updateProductShared(productId, objectParams.product_attributes, furniture)
    //     }
    //     const updatedProduct = await super.updateProduct(productId, objectParams)
    //     return updatedProduct
    // }
}

// register product types
ProductFactory.registerProductType(DOCUMENT_NAME.CLOTHING, Clothing, clothing)
ProductFactory.registerProductType(DOCUMENT_NAME.ELECTRONIC, Electronics, electronic)
ProductFactory.registerProductType(DOCUMENT_NAME.FURNITURE, Furniture, furniture)

module.exports = ProductFactory;
