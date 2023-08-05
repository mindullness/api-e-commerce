'use strict'

const mongoose = require('mongoose')
const os = require('os')
const process = require('process')

const _MINUTE = 1*60*1000

const countConnect = () => {
    const numConnection = mongoose.connections.length
    // mongoose.connections có các trạng thái 'status'
    // 0: disconnect
    // 2: connect success
    // 3: prepare
    // 4: in use
    console.log(`Number of connections:: ${numConnection}`)
    // Thường dùng khi: 
    //   + Khám sức khỏe định kỳ của SERVER
    //   + Check log tracking liên tục quá số lượng truy cập
}

// check overload: Thông báo khi server quá tải Connect
const checkOverload = () => {
    setInterval(() => {
        const numConnections = mongoose.connections.length
        const numCores = os.cpus().length // How many core
        const memoryUsage = process.memoryUsage().rss;
        // Maximum number of connections based on no. of Cores
        // Assuming 1 core can handle max 5 connections
        const _MAX_CONN_PER_CORE = 5 
        const maxConnections = numCores * _MAX_CONN_PER_CORE;

        console.log(`Active connections: ${numConnections}`)
        console.log(`CPU: ${numCores} core(s)`)
        console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`)
        // => 40 numConnections < 100 MAX  
        if (numConnections > maxConnections) {
            console.log(`Connection overload detected`)
        }

    }, _MINUTE) // Monitor every 5 seconds
}

module.exports = {
    countConnect,
    checkOverload
}