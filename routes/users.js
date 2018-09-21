const mongoose = require('mongoose');
const express = require('express');
const debug = require('debug')('app:startup');
const authMiddleware = require('../middleware/auth');
const bcrypt = require('bcrypt');
//const Fawn = require('fawn');
const { User, validate } = require('../models/user');
const router = express.Router();
//Fawn.init(mongoose, 'users_transactions);

router.get('/me', authMiddleware, async (req, res) => {
    let user = await User.findById(req.user._id).select('-password');

    if (user) res.send(user);
    else res.status(400).send('Invalid user');
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (!!error) return res.status(400).send(`Invalid request body\n${error}`);

    let user = await User.findOne({ email: req.body.email });

    if (!!user) {
        return res.status(400).send('User already registered');
    }

    user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });

    const salt = await bcrypt.genSalt(10); //pierwszy argument to ile razy ma sie
    //wykonac algorytm, zeby wygenerowac salt; czym wiecej
    // tym lepiej, ale dluzej bedzie sie wykonywal
    //drugi argument moze byc callbackiem, ale mozna rowniez skorzystac z promise'a
    user.password = await bcrypt.hash(user.password, salt);
    const token = user.generateAuthToken();

    user = await user.save();

    res.header('-x-auth-token', token).send(user);
});

module.exports = router;
