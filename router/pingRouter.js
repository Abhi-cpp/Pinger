const Ping = require('./../DB/schema/ping')
const express = require('express')
const Router = new express.Router()
const auth = require('../middleware/auth')


Router.post('/ping', auth, async (req, res) => {
    const ping = new Ping({
        ...req.body,
        owner: req.user._id
    })
    try {
        const t = await ping.save()
        res.status(201).send(t)
    }
    catch (e) {
        res.status(400).send(e)
    }
})

Router.get('/pings', auth, async (req, res) => {
    // send all pings of the user
    try {
        await req.user.populate('pings')
        res.send(req.user.pings)
    }
    catch (e) {
        res.status(500).send(e)
    }

})


Router.patch('/ping/:id', auth, async (req, res) => {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) return res.status(404).send()
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

Router.delete('/ping/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Ping.findOneAndDelete({ _id, owner: req.user._id });
        if (!task) return res.status(404).send()
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = Router