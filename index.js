const express = require('express')
require('dotenv').config()
const DBConnect = require('./DB/connect')
let port = process.env.PORT || 3000
const userRouter = require('./router/userRouter')
const pingRouter = require('./router/pingRouter')
const app = express()
const exect = require('./exec')

app.use(express.json())
app.use(userRouter)
app.use(pingRouter)
app.use(exect)


DBConnect().then(() => {
    console.log("connected to database")
    app.listen(port, () => {
        console.log("server running on port " + port)
    })
})