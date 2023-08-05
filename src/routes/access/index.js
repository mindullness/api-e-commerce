'use strict'

const express = require('express')
const accessController = require('../../controllers/access.controller')

const { authentication } = require('../../auth/authUtils')
const asyncHandler = require('../../helpers/asyncHandler')
const router = express.Router() // <== This is function, not CONST

// SignUp
router.post('/shop/signup', asyncHandler(accessController.signUp))
// SignIn
router.post('/shop/login', asyncHandler(accessController.login))

// Authentication //
router.use(authentication)
// LogOut
router.post('/shop/logout', asyncHandler(accessController.logout))
// Handle RefreshToken
router.post('/shop/handleRefreshToken', asyncHandler(accessController.handleRefreshToken))

module.exports = router
