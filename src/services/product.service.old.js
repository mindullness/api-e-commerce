'use strict'
/**
 * Implement Factory Pattern
 */

const { product, clothing, electronic } = require('../models/product.model')
const { BadRequestError } = require('../core/error.response')

// define Factory class to create product
class ProductFactoryService {
    /* 
        type: 'Clothing', 'Electrnoics',
        payload
    */
    static async createProduct(type, payload) {
        switch (type) {
            case 'Electronics':
                return new Electronics(payload).createProduct()
            case 'Clothing':
                return new Clothing(payload).createProduct()
            default:
                throw new BadRequestError(`Invalid Product Types ${type}`)
        }
    }
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
        return await product.create({ ...this, _id: productId });
    }
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
}

module.exports = ProductFactoryService;
