const mongoose = require('mongoose');
const express = require('express');
const debug = require('debug')('app:startup');
const router = express.Router();
const { Customer, validate } = require('../models/customer');

router.get('/', async (req, res) => {
    let customers;
    try{
        customers = await Customer
            .find()
            .sort({ name: 1 })
    }
    catch(err){
        return debug(err)
    }
    res.send(JSON.stringify(customers));
})

router.get('/:id', async (req, res) => {
    let customers;
    const { id } = req.params
    try{
        customers = await Customer
            .findById(id)
            .sort({ name: 1 })
            .select('-_id')
    }
    catch(err){
        return debug(err)
    }
    res.send(customers);
})

router.post('/', async (req, res) => {
    const { error } = validate(req.body)
    if(!!error){
        return res.status(400).send(error.details[0].message)
    } //albo robimy error handling tutaj, albo za pomocą try catch i schema
    let customer = new Customer({ 
        name: req.body.name,
        isGold: req.body.isGold,
        phone: req.body.phone
     })
    try{
        customer = await customer.save();
    }
    catch(err){
        return debug(err);
    }

    res.send(customer)
})

router.put('/:id', async(req, res) => {
    const { error } = validate(req.body)
    if(!!error){
        return res.status(400).send(error.details[0].message)
    }
    const { id } = req.params
    let customer;
    try{
        customer = await Customer.findByIdAndUpdate(id, { 
            name: req.body.name,
            isGold: req.body.isGold,
            phone: req.body.phone
        }, {
            new: true //to get an updated object from the database
        })
    }
    catch(err){
        return debug(err);
    }

    res.send(customer)
})

router.delete('/:id', async(req, res) => {
    const { id } = req.params
    try{
        const customer = await Customer.deleteOne({ _id: id })
    }
    catch(err){
        return debug(err);
    }
    res.send(customer)
})

module.exports = router;

