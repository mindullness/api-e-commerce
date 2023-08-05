'use strict'

const AccessService = require("../services/access.service")

const { OK, CREATED, SuccessResponse } = require('../core/success.response')

class AccessController {
    handleRefreshToken = async (req, res, next) => {
        // Version 2: fixed, no need accessToken
        new SuccessResponse({
            message: 'Get token success',
            metadata: await AccessService.handleRefreshToken({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore
            })
        }).send(res)
        // Version 1: accessToken non-sense
        // new SuccessResponse({
        //     message: 'Get token success',
        //     metadata: await AccessService.handleRefreshToken(req.body.refreshToken)
        // }).send(res)
    }

    logout = async (req, res, next) => {
        new SuccessResponse({
            message: 'Logout success!',
            metadata: await AccessService.logout(req.keyStore)
        }).send(res)
    }
    login = async (req, res, next) => {
        new SuccessResponse({
            metadata: await AccessService.login(req.body)
        }).send(res)
    }


    signUp = async (req, res, next) => {
        // delete trycatch due to using handle-error already, no need to use trycatch

        new CREATED({
            message: 'Registed OK!',
            metadata: (await AccessService.signUp(req.body)),
            options: {
                litmit: 10
            }
        }).send(res)

        // return res.status(201).json(await AccessService.signUp(req.body))
    }
}

module.exports = new AccessController()
