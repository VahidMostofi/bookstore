const express = require('express')
const port = process.env.PORT
const userRouter = require('./routers/user')
const morgan = require('morgan')
require('./db/db')

const app = express()
app.use(morgan('combined'))
app.use(express.json())
app.use(userRouter)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})