const mongoose = require('mongoose');
const express = require('express');
const debug = require('debug')('app:startup');
const authMiddleware = require('../middleware/auth');
const bcrypt = require('bcrypt');
const Joi = require('Joi');
const { User } = require('../models/user');
const router = express.Router();

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (!!error) return res.status(400).send(error.details[0].message);

    user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send(`Invalid email or no such user`);

    const isAuth = await bcrypt.compare(req.body.password, user.password);
    const token = user.generateAuthToken();

    if (isAuth) res.header('-x-auth-token', token).send(`You're logged in`);
    else res.send('Invalid password');
});

function validate(user) {
    // const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    const schema = {
        email: Joi.string()
            .email()
            .required(),
        password: Joi.string()
            .min(8)
            .max(40)
            .required()
    };

    return Joi.validate(user, schema);
}

module.exports = router;
