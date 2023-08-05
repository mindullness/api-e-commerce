'use strict'

// _ : underscore is used to sign for lodash
const _ = require('lodash')
const { Types } = require('mongoose')

const converToObjectIdMongodb = id => Types.ObjectId(id)
const getInfoData = ({ object = {}, fields = [] }) => {
    return _.pick(object, fields)
}

// ['A', 'B'] => {a: 1, b: 1}
const getSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el, 1]))
}
// ['A', 'B'] => {a: 0, b: 0}
const getUnSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el, 0]))
}
// remove null or undefined object when update product
// const removeUndefinedObject = obj => {
//     Object.keys(obj).forEach(k => {
//         if (obj[k] == null) {
//             delete obj[k]
//         }
//     })
//     return obj
// }

const typeOf = val => Object.prototype.toString.call(val).slice(8, -1)
// remove null or undefined nested object when update product
const updateNestedObjectParser = obj => {
    const final = {}

    Object.keys(obj).forEach(k => {
        const objValue = obj[k]
        if (typeOf(objValue) === 'Object') {
            const response = updateNestedObjectParser(objValue)

            Object.keys(response).forEach(a => {
                final[`${k}.${a}`] = response[a]
            })
        } else {
            // Only get fields that contain values 
            if (objValue !== undefined && objValue !== null) {
                final[k] = obj[k]
            }
        }
    })
    // console.log('FINAL:: ', final)
    return final
}

module.exports = {
    getInfoData,
    getSelectData,
    getUnSelectData,
    updateNestedObjectParser,
    converToObjectIdMongodb
}