// Build packages dotenv to use .env file
// Install: npm i dotenv
require('dotenv').config()

// packages
const express = require('express')
const morgan = require('morgan')
const { default: helmet } = require('helmet')
const compression = require('compression')

const app = express()

// console.log(`Process:: `, process.env)

////////////////////////////////////////////////////////////////////////////////////
//////////// *** init middlewares ***

// ### install package 'morgan': npm i morgan --save-dev
// morgan libs => print logs when user run a request
// 5 modes: dev, combined, common, short, tiny
app.use(morgan("dev"))
// app.use(morgan("combined")) // using when run in 'production'
// app.use(morgan("common"))
// app.use(morgan("short"))
// app.use(morgan("tiny"))

// ### install package 'helmet': npm i morgan --save-dev
// helmet libs => ... bảo vệ trang web từ những bên thứ 3 truy cập vào để attack
app.use(helmet())

// ### install package 'compression': npm i compression --save-dev
// compression libs => ...
app.use(compression())
// express version 4 đã hộ trợ urlcode => ko cần cài parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// ### install package 'morgan' npm i morgan --save-dev
// *** morgan libs to print logs when user run a request

////////////////////////////////////////////////////////////////////////////////////
//////////// *** init db ***
require('./db/init.mongodb')
const { checkOverload } = require('./helpers/check.connect')
checkOverload()


////////////////////////////////////////////////////////////////////////////////////
//////////// *** init routes ***
app.use('/', require('./routes'))

////////////////////////////////////////////////////////////////////////////////////
//////////// *** handling error ***
// place "handling error after routes"
// 3 parameters at method definition ==> middleware
app.use((req, res, next) => {
    const error = Error('Not found')
    error.status = 404
    next(error)
})
// 4 parameter => handling error method
app.use((error, req, res, next) => {
    const statusCode = error.status || 500
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        stack: error.stack,
        message: error.message || 'Internal Server Error'
    })
})

module.exports = app;

