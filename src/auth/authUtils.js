'use strict'

const JWT = require('jsonwebtoken');
const asyncHandler = require('../helpers/asyncHandler');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { findByUserId } = require('../services/keyToken.service');

const HEADER = {
    API_KEY: "x-api-key",
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: "authorization",
    REFRESHTOKEN: 'x-rtoken-id'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // payload: {userId, email}
        // accessToken: created from publicKey
        const accessToken = await JWT.sign(payload, publicKey, {
            expiresIn: '1 day'
        })
        
        // refreshToken: created from privateKey
        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: '7 days'
        })

        // verify using publicToken
        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.log(`error verify:: `, err);
            } else {
                console.log(`decode verify:: `, decode)
            }
        })
        return { accessToken, refreshToken }
    } catch (error) {

    }
}

// Authen utils:: middleware
// Version 2: fixed, NO NEED ACCESSTOKEN
const authentication = asyncHandler(async (req, res, next) => {
    /* 
        1. Check userId missing ???
        2. Get accessToken
        3. Verify token
        4. Check user in DBs?
        5. Check keyStore by this userId
        6. ALL OK => return next()
    */
    // 1. Check clientId is brought with header ???
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) throw new AuthFailureError('Invalid Request')
    // 2. Get accessToken
    const keyStore = await findByUserId(userId)
    if (!keyStore) throw new NotFoundError('Not found keyStore')
    // 3. Verify token
    const refreshToken = req.headers[HEADER.REFRESHTOKEN]
    if(refreshToken) {
        try {
            const decodeUser = JWT.verify(refreshToken, keyStore.privateKey)
            if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid UserId')
            
            req.keyStore = keyStore
            req.user = decodeUser
            req.refreshToken = refreshToken

            return next()
        } catch (error) {
            throw error
        }
    }
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if (!accessToken) throw new AuthFailureError('Invalid Request')
    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid UserId')

        req.user = decodeUser
        req.keyStore = keyStore
        return next()
    } catch (error) {
        throw error
    }
})

// Version 1: Verify token is non-sense here
// const authentication = asyncHandler(async (req, res, next) => {
//     /* 
//         1. Check userId missing ???
//         2. Get accessToken
//         3. Verify token
//         4. Check user in DBs?
//         5. Check keyStore by this userId
//         6. ALL OK => return next()
//     */

//     // 1. Check clientId is brought with header ???
//     const userId = req.headers[HEADER.CLIENT_ID]
//     if (!userId) throw new AuthFailureError('Invalid Request')

//     // 2. Get accessToken
//     const keyStore = await findByUserId(userId)
//     if (!keyStore) throw new NotFoundError('Not found keyStore')

//     // 3. Verify token
//     const accessToken = req.headers[HEADER.AUTHORIZATION]
//     if (!accessToken) throw new AuthFailureError('Invalid Request')

//     try {
//         const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
//         if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid UserId')

//         req.keyStore = keyStore
//         return next()
//     } catch (error) {
//         throw error
//     }
// })

const verifyJWT = async (token, keySecret) => {
    return await JWT.verify(token, keySecret)
}

module.exports = { createTokenPair, authentication, verifyJWT }
