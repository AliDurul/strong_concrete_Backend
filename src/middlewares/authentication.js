"use strict"

const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {

    const auth = req.headers?.authorization || null
    const accessToken = auth ? auth.split(' ')[1] : null

    jwt.verify(accessToken, process.env.ACCESS_KEY, (err, userData) => req.user = userData)
    next()
}