'use strict'

const { findById } = require("../services/apikey.service");

const HEADER = {
    API_KEY: "x-api-key",
    AUTHORIZATION: "authorization"
}

// this is a middleware
const apiKey = async (req, res, next) => {
    try {
        // Kiểm tra request header có tồn tại apiKey hay chưa
        const key = req.headers[HEADER.API_KEY]?.toString();
        if (!key) {
            return res.status(403).json({
                message: "Forbidden Error"
            })
        }
        // check objKey
        const objKey = await findById(key);
        if (!objKey) {
            return res.status(403).json({
                message: "Forbidden Error"
            })
        }

        req.objKey = objKey;
        return next();
    } catch (error) {

    }
}

// Check permissions
/**
 * Hàm closure
 */
const permission = (permission) => {
    return (req, res, next) => {
        if (!req.objKey.permissions) {
            return res.status(403).json({
                message: 'permission denied'
            });
        }
        console.log('permissions:: ', req.objKey.permissions);
        const validPermission = req.objKey.permissions.includes(permission);
        if (!validPermission) {
            return res.status(403).json({
                message: 'permission denied'
            });
        }

        return next();
    }
}

module.exports = { apiKey, permission, }
