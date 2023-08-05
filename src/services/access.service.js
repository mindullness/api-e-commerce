'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const { getInfoData } = require("../utils") // Using lodash to pick fields in object
const { createTokenPair, verifyJWT } = require('../auth/authUtils')
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response")

/// service ///
const { findByEmail } = require("./shop.service")

const RolesShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITE',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {

    /*
        Check this refresh token used ???
    */
    // Version 2:
    static handleRefreshToken = async ({ keyStore, user, refreshToken }) => {
        const { userId, email } = user;
        if (keyStore.refreshTokenUsed.includes(refreshToken)) {
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Something wrong happened! Please re-login!')
        }

        if (keyStore.refreshToken !== refreshToken) throw new AuthFailureError('Shop was not registered!')

        // check userId(Shop's Id) EXISTED ???
        const foundShop = await findByEmail({ email })
        if (!foundShop) throw new AuthFailureError('Shop was not registered!!')

        // provide a new tokens pair
        // save this refreshToken into "refreshTokenUsed array"
        const newTokens = await createTokenPair({ userId, email }, keyStore.publicKey, keyStore.privateKey)

        // update token
        await keyStore.updateOne({
            $set: { // replace with new refreshToken
                refreshToken: newTokens.refreshToken
            },
            $addToSet: { // add the old refreshToken to 'refreshTokenUsed'
                refreshTokenUsed: refreshToken
            }
        })

        return {
            user,
            tokens: newTokens
        }
    }

    // Version 1: AccessToken non-sense
    // static handleRefreshToken = async (refreshToken) => {
    //     const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
    //     // In case: refreshToken has been USED
    //     if (foundToken) {
    //         // decode who is using this refreshToken that has been USED
    //         const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey)
    //         console.log(`FOUND REFRESH_TOKEN USED:: `, { userId, email })
    //         // Delete all tokens in keyStore
    //         await KeyTokenService.deleteKeyById(userId)
    //         throw new ForbiddenError('Something wrong happened! Please re-login!')
    //     }
    //     // In case: refreshToken has NOT been used
    //     const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
    //     // If refreshToken NOT EXISTED
    //     if (!holderToken) throw new AuthFailureError('Shop was not registered!')

    //     // Verify Token
    //     const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey)

    //     // check userId(Shop's Id) EXISTED ???
    //     const foundShop = await findByEmail({ email })
    //     if (!foundShop) throw new AuthFailureError('Shop was not registered!!')

    //     // provide a new tokens pair
    //     // save this refreshToken into "refreshTokenUsed array"
    //     const newTokens = await createTokenPair({ userId, email }, holderToken.publicKey, holderToken.privateKey)

    //     // update token
    //     await holderToken.updateOne({
    //         $set: { // replace with new refreshToken
    //             refreshToken: newTokens.refreshToken
    //         },
    //         $addToSet: { // add the old refreshToken to 'refreshTokenUsed'
    //             refreshTokenUsed: refreshToken
    //         }
    //     })

    //     return {
    //         user: { userId, email },
    //         newTokens
    //     }
    // }

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.log(`delKey:: `, delKey)
        return delKey
    }

    /**
     * LogIn function
     * @param {*} param0 
     */
    /*
        1. Check email in Dbs
        2. Match password
        3. create AT vs RT and Save (accessToken vs RefreshToken) 
        4. generate tokens
        5. get data return login
    */
    static login = async ({ email, password, refreshToken = null }) => {

        // 1. Check email in Dbs
        const foundShop = await findByEmail({ email });

        if (!foundShop) throw new BadRequestError('Shop was not registered!')
        // 2. Match password
        const match = bcrypt.compare(password, foundShop.password)
        if (!match) throw new AuthFailureError('Authentication error')
        // 3. create AT vs RT and Save (accessToken vs RefreshToken)
        const { publicKey, privateKey } = generateKeys()
        // 4. generate tokens
        const userId = foundShop._id
        const tokens = await createTokenPair({ userId, email }, publicKey, privateKey)
        // console.log(`TOKEN::`, tokens);
        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey,
            publicKey,
            userId
        })
        // .then(() => {
        //     return {
        //         shop: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop }),
        //         tokens

        //     }
        // })
        return {
            shop: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop }),
            tokens
        }
    }

    /**
     * Sign Up function
     * @param {*} param0 
     * @returns 
     */
    static signUp = async ({ name, email, password }) => {

        // Step 1: Check email existence ??
        const holderShop = await shopModel.findOne({ email }).lean()
        if (holderShop) {
            throw new BadRequestError('Error: Shop was already registered')
        }
        const passwordHashed = await bcrypt.hash(password, 10)
        const newShop = await shopModel.create({
            name, email, password: passwordHashed, roles: [RolesShop.SHOP]
        })

        if (newShop) {
            /**
             * Flow of accessToken:
             * 1. generating accessToken
             * 2. convert "publicKey" to hashString() (json string) and save "publicKey" to DB
             * 3. return "publicKey" from DB, not from generating "Method"
            */

            // Simple way::
            const { publicKey, privateKey } = generateKeys()
            // console.log({ privateKey, publicKey })
            // if exist save collection Keystore
            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey
            })

            //// keyStore Error
            if (!keyStore) {
                throw new BadRequestError('Error: Shop was already registered')
                // return {
                //     code: 'xxxx',
                //     message: 'keyStore error'
                // }
            }

            // create token pair
            const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)
            console.log(`Created Token Success::`, tokens)

            // Lodash handling:
            return {
                shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop }),
                tokens
            }
            // Manual handling:
            // return {
            //     code: 201,
            //     metadata: {
            //         shop: {
            //             _id: newShop._id,
            //             name: newShop.name,
            //             email: newShop.email
            //         },
            //         tokens
            //     }
            // }
        }
        // create success but return null
        return {
            code: 200,
            metadata: null
        }
    }
}

module.exports = AccessService

function generateKeys() {
    const privateKey = crypto.randomBytes(64).toString('hex')
    const publicKey = crypto.randomBytes(64).toString('hex')
    return { publicKey, privateKey }
}
