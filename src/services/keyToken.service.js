'use strict'

const keytokenModel = require("../models/keytoken.model")
const { Types } = require('mongoose')

class KeyTokenService {
    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
        // try {
        //// Level 0
        // const tokens = await keyTokenModel.create({
        //     user: userId,
        //     publicKey,
        //     privateKey
        // })

        // return tokens ? tokens.publicKey : null
        // } catch (error) {
        //     return error
        // }

        //// Level 1
        const filter = { user: userId },
            update = { publicKey, privateKey, refreshTokenUsed: [], refreshToken },
            options = { upsert: true, new: true }
        /* findOneAndUpdate: an atomic function in database */
        const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)
        return tokens ? tokens.publicKey : null
    }

    static findByUserId = async (userId) => {
        return await keytokenModel.findOne({ user: new Types.ObjectId(userId) })
    }

    static removeKeyById = async (id) => {
        return await keytokenModel.findByIdAndRemove(id)
    }

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keytokenModel.findOne({ refreshTokenUsed: refreshToken }).lean()
    }
    static findByRefreshToken = async (refreshToken) => {
        return await keytokenModel.findOne({ refreshToken })
    }

    static deleteKeyById = async (userId) => {
        return await keytokenModel.findOneAndDelete({ user: userId })
    }
}

module.exports = KeyTokenService
