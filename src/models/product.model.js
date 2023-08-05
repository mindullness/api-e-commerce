'use strict'

const { model, Schema } = require('mongoose'); // Erase if already required
const slugify = require('slugify')

const DOCUMENT_NAME = {
    PRODUCT: 'Product',
    CLOTHING: 'Clothing',
    ELECTRONIC: 'Electronic',
    FURNITURE: 'Furniture'
}
const COLLECTION_NAME = {
    PRODUCTS: 'Products',
    CLOTHES: 'Clothes',
    ELECTRONICS: 'Electronics',
    FURNITURES: 'Furnitures'
}

// Declare the Schema of the Mongo model
const productSchema = new Schema({
    // product_name: "seven habits of highly effective people"
    product_name: { type: String, required: true },
    product_thumb: { type: String, required: true },
    product_description: String,
    product_price: { type: Number, required: true },
    product_quantity: { type: Number, required: true },
    product_type: {
        type: String, required: true,
        enum: [
            DOCUMENT_NAME.CLOTHING,
            DOCUMENT_NAME.ELECTRONIC,
            DOCUMENT_NAME.FURNITURE
        ]
    },
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    product_attributes: { type: Schema.Types.Mixed, required: true },
    //////////// modify: add more attribute
    // slug: insert hyphen between each word
    // Eg: seven-habits-of-highly-effective-people
    product_slug: String,
    product_ratingsAvg: {
        type: Number,
        default: 4.5,
        min: [1, "Rating must be above 1.0"],
        max: [5, "Rating must be above 5.0"],
        // rounding: 4.354666 => 4.3
        set: (val) => Math.round(val * 10) / 10
    },
    product_variations: { type: Array, default: [] },
    isDraft: { type: Boolean, default: true, index: true, select: false },
    isPublished: { type: Boolean, default: false, index: true, select: false }
}, {
    collection: COLLECTION_NAME.PRODUCTS,
    timestamps: true
});

// Create INDEX for SEARCH
productSchema.index({ product_name: 'text', product_description: 'text' })

// Hook: Đc sử dụng trc khi Document đc save()
// Document middleware: run before .save() and .create()..
productSchema.pre('save', function (next) {
    this.product_slug = slugify(this.product_name, { lower: true })
    next()
})

/////////////////////////////////////
//       Product Attributes        //
/////////////////////////////////////
// define the product type = clothing
const clothingSchema = new Schema({
    brand: { type: String, require: true },
    size: String,
    material: String,
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' }
}, {
    collection: COLLECTION_NAME.CLOTHES,
    timestamps: true
})
const electronicsSchema = new Schema({
    manufacturer: { type: String, require: true },
    model: String,
    color: String,
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' }
}, {
    collection: COLLECTION_NAME.ELECTRONICS,
    timestamps: true
})
const furnituresSchema = new Schema({
    brand: { type: String, require: true },
    size: String,
    material: String,
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' }
}, {
    collection: COLLECTION_NAME.FURNITURES,
    timestamps: true
})


//Export the model
module.exports = {
    product: model(DOCUMENT_NAME.PRODUCT, productSchema),
    electronic: model(DOCUMENT_NAME.ELECTRONIC, electronicsSchema),
    clothing: model(DOCUMENT_NAME.CLOTHING, clothingSchema),
    furniture: model(DOCUMENT_NAME.FURNITURE, furnituresSchema),
    DOCUMENT_NAME
};
