'use strict'

const { resolve } = require('path')
const redis = require('redis')
const { promisify } = require('util')
const { reservationInventory } = require('../models/repositories/inventory.repo')
const redisClient = redis.createClient()

const pexpire = promisify(redisClient.pexpire).bind(redisClient)
const setnxAsync = promisify(redisClient.setnx).bind(redisClient)

const acquireLock = async (productId, quantity, cartId) => {
    // assign this lock key to first person access to buy the product
    // perform: check quantity in inventories, order then return the key
    const key = `lock_v2023_${productId}`
    // number of times user can wait/retry to get the key
    const retryTimes = 10
    // 3 seconds to lock temporarily
    const expireTime = 3000

    for (let i = 0; i < retryTimes.length; i++) {
        // create one key, user kept it can access to payment
        const result = await setnxAsync(key, expireTime)
        console.log(`result:: `, result)

        if (result === 1) {
            // perform on inventory
            const isReservation = await reservationInventory({
                productId, quantity, cartId
            })
            if (isReservation.modifiedCount) {
                await pexpire(key, expireTime)
                return key
            }
            return null
        } else {
            await new Promise((resolve) => setTimeout(resolve, 50))
        }
    }
}

const releaseLock = async keyLock => {
    const delAsyncKey = promisify(redisClient.del).bind(redisClient)
    return await delAsyncKey
}

module.exports = {
    acquireLock,
    releaseLock
}