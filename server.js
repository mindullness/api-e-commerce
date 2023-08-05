// const { notify } = require('./src/app')
const app = require("./src/app");
const { app: { port } } = require("./src/configs/config.mongodb")
const PORT = port || 3052

const server = app.listen(PORT, () => {
    console.log(`WSV eCommerce start with ${PORT}`)
})

// process.on('SIGINT', () => {
//     server.close(() => console.log(`Exit Server Express`))
//     notify.send('ping...')
// })