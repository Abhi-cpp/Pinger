const express = require('express')
const router = new express.Router()
const User = require('./../DB/schema/user')
const auth = require('../middleware/auth')

//signup
router.post("/users", async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        console.log(e);
        res.status(400).send(e)
    }
})

//login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

//logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//logout of all devices
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.send(500).send()
    }
})


// delete user by id
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        deleteAck(req.user.email, req.user.name)
        res.status(200).send(req.user)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

module.exports = router