const express = require('express');
const debug = require('debug')('app:startup');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { Customer, validate } = require('../models/customer');

router.get('/', async (req, res) => {
    let customers = await Customer.find().sort({ name: 1 });
    res.send(JSON.stringify(customers));
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    let customers = await Customer.findById(id)
        .sort({ name: 1 })
        .select('-_id');
    res.send(customers);
});

router.post('/', authMiddleware, async (req, res) => {
    const { error } = validate(req.body);
    if (!!error) {
        return res.status(400).send(error.details[0].message);
    } //albo robimy error handling tutaj, albo za pomocą try catch i schema
    let customer = new Customer({
        name: req.body.name,
        isGold: req.body.isGold,
        phone: req.body.phone
    });
    customer = await customer.save();

    res.send(customer);
});

router.put('/:id', authMiddleware, async (req, res) => {
    const { error } = validate(req.body);
    if (!!error) {
        return res.status(400).send(error.details[0].message);
    }
    const { id } = req.params;
    let customer = await Customer.findByIdAndUpdate(
        id,
        {
            name: req.body.name,
            isGold: req.body.isGold,
            phone: req.body.phone
        },
        {
            new: true //to get an updated object from the database
        }
    );

    res.send(customer);
});

router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const customer = await Customer.deleteOne({ _id: id });

    res.send(customer);
});

module.exports = router;
