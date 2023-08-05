'use strict'

const apiKeyModel = require("../models/apiKey.model")
const crypto = require('crypto')
const findById = async (key) => {
    // const testKey = await apiKeyModel.create({ key: crypto.randomBytes(64).toString('hex'), permissions: ['0000'] })
    // console.log(testKey);
    const objKey = await apiKeyModel.findOne({ key, status: true }).lean();
    return objKey;
}
module.exports = { findById }
