'use strict'

const { NotFoundError } = require("../core/error.response")
const { cart } = require("../models/cart.model")
const { getProductById } = require("../models/repositories/product.repo")

/*
    Key features: Cart Service
    - Add product to cart [user]
    - Reduce product quantity by 1 [user]
    - Increase product quantity by 1 [user]
    - Get cart [user]
    - Delete cart [user]
    - Delete cart item [user]
*/
class CartService {

    /// START REPO CART ///
    static async createUserCart({ userId, product }) {
        const query = { cart_userId: userId, cart_state: 'active' },
            updateOrInsert = {
                $addToSet: {
                    cart_products: product
                }
            }, options = { upsert: true, new: true }

        return await cart.findOneAndUpdate(query, updateOrInsert, options)
    }
    static async updateUserCartQuantity({ userId, product }) {
        const { productId, quantity } = product
        console.log('REPO::: ', { productId, quantity })
        const query = {
            cart_userId: userId,
            'cart_products.productId': productId,
            cart_state: 'active'
        }, updateSet = {
            $inc: {
                'cart_products.$.quantity': quantity
            }
        }, options = { upsert: true, new: true }

        return await cart.findOneAndUpdate(query, updateSet, options)
    }
    /// END REPO CART ///

    static async addToCart({ userId, product = {} }) {
        // Check product
        const foundProduct = await getProductById(product.productId)
        if (!foundProduct) throw new NotFoundError("Product is not exist")
        product = {
            ...product,
            name: foundProduct.product_name,
            price: foundProduct.product_price
        }
        // check cart existed or not
        const userCart = await cart.findOne({ cart_userId: userId })
        if (!userCart) {
            // create cart for User
            return await CartService.createUserCart({ userId, product })
        }
        // Cart existed but Not Products
        if (!userCart.cart_products.length) {
            userCart.cart_products = [product]
            return await userCart.save()
        }
        // Cart existed and Products as well => update quantity
        return await CartService.updateUserCartQuantity({ userId, product })
    }
    // Update Cart
    /*
        shop_order_ids: [
            {
                shopId, 
                item_products: [
                    {
                        quantity,
                        price,
                        shopId,
                        old_quantity,
                        productId
                    }
                ],
                version: // pessimistic, optimistic locking
            }
        ]
    */
    static async updateCart({ userId, shop_order_ids }) {
        const { productId, quantity, old_quantity } = shop_order_ids[0]?.item_products[0]

        // Check product
        const foundProduct = await getProductById(productId)
        if (!foundProduct) throw new NotFoundError("Product is not exist")

        // compare
        if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
            throw new NotFoundError("Product is not exist")
        }

        if (quantity === 0) {
            //delete product
            return await CartService.deleteCartItem({ userId, productId })
        }

        return await CartService.updateUserCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - old_quantity,
                // name: foundProduct.product_name,
                // price: foundProduct.product_price
            }
        })
    }

    // DELETE
    static async deleteCartItem({ userId, productId }) {
        const query = { cart_userId: userId, cart_state: 'active' },
            updateSet = {
                $pull: {
                    cart_products: {
                        productId
                    }
                }
            }
        const deletedCart = await cart.updateOne(query, updateSet)
        return deletedCart
    }

    static async getListUserCart({ userId }) {
        return await cart.findOne({
            cart_userId: +userId
        }).lean()
    }
}

module.exports = CartService
