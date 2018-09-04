const mongoose = require('mongoose');
const express = require('express');
const debug = require('debug')('app:startup');
const Fawn = require('fawn');
const { Rental, validate } = require('../models/rental')
const { Movie } = require('../models/movie');
const { Customer } = require('../models/customer');
const router = express.Router();
Fawn.init(mongoose);

router.get('/', async(req, res) => {
    let rentals;
    try{
        rentals = await Rental
        .find()
        .populate('customer', 'name -_id')
        .populate({
            path: 'movie',
            select: 'title genre -_id'
        })
        //.select('customer movie dateOut')
        .select('movie customer dateOut -_id')
    }
    catch(err){ return res.status(400).send(`Invalid query:\n${err}`)}

    try{ res.send(rentals); }
    catch(err){ return res.status(500).send(`Something went wrong ${err}`)}
})

router.get('/:id', async(req, res) => {
    let rentals;
    let { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).send('Invalid id')

    try{
        rentals = await Rental
        .find({ _id: id})
        .populate('customer', 'name -_id')
        .populate({
            path: 'movie',
            select: 'title genre -_id'
        })
        //.select('customer movie dateOut')
        .select('movie customer dateOut -_id')
    }
    catch(err){ return res.status(400).send(`Invalid query:\n${err}`)}

    try{ res.send(rentals); }
    catch(err){ return res.status(500).send(`Something went wrong ${err}`)}
})

router.post('/', async(req, res) => {
    const { error } = validate(req.body);
    if(!!error) return res.status(400).send(error.details[0].message);

    let movie, customer;

    try { movie = await Movie.findById(req.body.movie); }
    catch(err){ return res.status(400).send(`Invalid movie ${err}`); }

    if(movie.numberInStock === 0){
        return res.status(500).send("There's no more copies :(")
    }

    try { customer = await Customer.findById(req.body.customer); }
    catch(err){ return res.status(400).send(`Invalid customer ${err}`) }

    let rental = new Rental({
        movie: movie._id,
        customer: customer._id,
        rentalFee: req.body.rentalFee
    })

    /*try{ rental = await rental.save(); }
    catch(err){ return res.status(400).send('Something went wrong'); }*/
    try{
        new Fawn.Task()
            .save('rentals', rental)
            //we have to pass actual name of the collection
            //which is plural, not singural, becouse we
            //are working with colleciton directly
            //it's case sensetive also
            .update('movies', {_id: movie._id}, {
                $inc: { numberInStock: -1 }
            })
            //update movies collection, specifically value with given ID,
            //and increment it's property numberInStock by -1 - decrement
            //.remove() - przykladowa nastepna operacja
            .run()
    }
    catch(err){ return res.status(500).send(`Something failed, ${err}`); }


    try{ res.send(rental); }
    catch(err){ return res.status(500).send(`Something went wrong ${err}`)}
})

router.put('/:id', async(req, res) => {
    const { error } = validate(req.body);
    if(!!error) return res.status(400).send(error.details[0].message);
    let { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).send('Invalid id')

    let movie, customer, rental;

    try { movie = await Movie.findById(req.body.movie); }
    catch(err){ return res.status(400).send(`Invalid movie ${err}`); }


    try { customer = await Customer.findById(req.body.customer); }
    catch(err){ return res.status(400).send(`Invalid customer ${err}`) }

    /*try { rental = await Renatl.findById(id); }
    catch(err){ return res.status(400).send(`Invalid customer ${err}`) }*/

    const tempObj = {
        movie: movie._id,
        customer: customer._id,
        rentalFee: !!req.body.rentalFee ? req.body.rentalFee : undefined,
        dateReturned: !!req.body.dateReturned ? req.body.dateReturned : undefined,
        dateOut: !!req.body.dateOut ? req.body.dateOut : undefined
    }

    Object.keys(tempObj).forEach(key => tempObj[key] === undefined && delete tempObj[key]);

    try{
        rental = await Rental.findOneAndUpdate({ _id: id }, {...tempObj}, {
            new: true
        });
    }
    catch(err){ return res.status(500).send(`Something failed, ${err}`); }

    try{ res.send(rental); }
    catch(err){ return res.status(500).send(`Something went wrong ${err}`)}
})

module.exports = router;