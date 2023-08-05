'use strict'

const { model, Schema, Types } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Inventory'
const COLLECTION_NAME = 'Inventories'

// Declare the Schema of the Mongo model
const inventorySchema = new Schema({
    inven_productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    inven_location: { type: String, default: 'unknown' },
    inven_stock: { type: Number, require: true },
    inven_shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
    inven_reservations: { type: Array, default: [] },
    /*  Reservations: 1 thông lệ phổ biến đc thiết lập trc khi User đặt 1 sản phẩm
        // việc lưu reservation giúp: 
            + Ngăn ngừa lỗi hàng tồn kho
            + Đảm bảo User nhận đc sp họ ĐÃ ĐẶT
        // Khi thanh toán => trừ vào hàng tồn kho
        // 1. Shopee: Khi đặt hàng ko trừ vào hàng tồn kho
        // 2. Amazon: Khi đặt hàng trừ vào hàng tồn kho
         cartId: ,
         stock: 1,
         createdAt: 
    */
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = { inventory: model(DOCUMENT_NAME, inventorySchema) };
