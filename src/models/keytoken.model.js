'use strict'

const { Schema, model } = require('mongoose'); // Erase if already required

// Model KeyStore: 
// this model responsibility is to store publicKey of each user, 
// store an array of refreshtoken that USED considering to have unsual behavior (Eg: hacker actions)
const DOCUMENT_NAME = 'Key'
const COLLECTION_NAME = 'Keys'

// Declare the Schema of the Mongo model
const keyTokenSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Shop'
    },
    privateKey: {
        type: String,
        required: true,
    },
    publicKey: {
        type: String,
        required: true,
    },
    refreshTokenUsed: {
        type: Array,
        default: [] // những RT đã đc sử dụng
    },
    refreshToken: {
        type: String,
        required: true
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = model(DOCUMENT_NAME, keyTokenSchema);