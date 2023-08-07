'use strict'

const express = require('express')
const { apiKey, permission } = require('../auth/checkAuth')
const router = express.Router() // <== This is function, not CONST

// Check apiKey
router.use(apiKey);
// // Check permission to access our server of this apiKey 
router.use(permission('0000'))


router.use('/v1/api/discount', require('./discount'))
router.use('/v1/api/product', require('./product'))
router.use('/v1/api', require('./access'))

module.exports = router
