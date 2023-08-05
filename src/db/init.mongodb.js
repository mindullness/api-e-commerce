'use-strict'

const mongoose = require('mongoose')

const { db: { host, name, port } } = require('../configs/config.mongodb')
const connectString = `mongodb://${host}:${port}/${name}`

const { countConnect } = require('../helpers/check.connect')

class Database {
    constructor() {
        this.connect()
    }
    // connect
    connect(type = 'mongodb') {
        // dev
        if (1 === 1) {
            mongoose.set('debug', true)
            mongoose.set('debug', { color: true })
        }

        mongoose.connect(connectString, { maxPoolSize: 50 }).then(_ => {
            countConnect()
            console.log(`Connected Mongodb Successfully`, connectString)
        })
            .catch(err => console.log(`Error Connect!${err}`))
    }

    static getInstance() {
        return Database.instance ?? new Database() // <<== SINGLETON nè
        // if(!Database.instance) {
        //     Database.instance = new Database()
        // }
        // return Database.instance
    }
}

const instanceMongoDb = Database.getInstance()
module.exports = instanceMongoDb
