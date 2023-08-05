'use strict'

const { StatusCodes, ReasonPhrases } = require("../utils/httpStatusCode")

class SuccessResponse {

    constructor({
        message, statusCode = StatusCodes.OK,
        reasonStatusCode = ReasonPhrases.OK,
        metadata = { }
    }) {
        this.message = !message ? reasonStatusCode : message
        this.status = statusCode
        this.metadata = metadata
    }

    send(res, headers = {}) {
        return res.status(this.status).json(this)
    }
}

class OK extends SuccessResponse {
    constructor({ message, metadata }) {
        super({ message, metadata })
    }
}

class CREATED extends SuccessResponse {
    constructor({
        message,
        statusCode = StatusCodes.CREATED,
        reasonStatusCode = ReasonPhrases.CREATED,
        metadata,
        options = {}
    }) {
        super({ message, statusCode, reasonStatusCode, metadata })
        this.options = options
    }
}

module.exports = {
    OK, CREATED, SuccessResponse
}