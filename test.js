
// const typeOf = val => Object.prototype.toString.call(val)

// console.log(typeOf({ name: 'Toan' }))

const today = new Date()
const start_date = new Date("2023-08-25")
const end_date = new Date("2023-08-25")
console.log(today < new Date(start_date)) 

console.log(today > new Date(end_date))