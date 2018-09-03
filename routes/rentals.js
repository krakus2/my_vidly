const mongoose = require('mongoose');
const express = require('express');
const debug = require('debug')('app:startup');
const { Rental, validate } = require('../models/rental')
const { Movie } = require('../models/movie');
const { Customer } = require('../models/customer');
const router = express.Router();

router.post('/', async(req, res) => {
    const { error } = validate(req.body);
    if(!!error) return res.status(400).send(error.details[0].message);

    let movie, customer;

    try { movie = await Movie.findById(req.body.movie); }
    catch(err){ return res.status(400).send(`Invalid movie ${err}`); }

    try { customer = await Customer.findById(req.body.customer); }
    catch(err){ return res.status(400).send(`Invalid customer ${err}`) }

    let rental = new Rental({
        movie: movie._id,
        customer: customer._id,
        rentalFee: req.body.rentalFee
    })

    try{ rental = await rental.save(); }
    catch(err){ return res.status(400).send('Something went wrong'); }

    res.send(rental);
})

module.exports = router;