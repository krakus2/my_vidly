const mongoose = require('mongoose');
const express = require('express');
const debug = require('debug')('app:startup');
const Fawn = require('fawn');
const { Rental, validate } = require('../models/rental');
const { Movie } = require('../models/movie');
const { Customer } = require('../models/customer');
const authMiddleware = require('../middleware/auth');
const router = express.Router();
Fawn.init(mongoose, 'rentals_transaction');

router.get('/', async (req, res) => {
    let rentals = await Rental.find()
        .populate('customer', 'name -_id')
        .populate({
            path: 'movie',
            select: 'title genre -_id'
        })
        //.select('customer movie dateOut')
        .select('movie customer dateOut -_id');

    res.send(rentals);
});

router.get('/:id', async (req, res) => {
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).send('Invalid id');

    let rentals = await Rental.find({ _id: id })
        .populate('customer', 'name -_id')
        .populate({
            path: 'movie',
            select: 'title genre -_id'
        })
        //.select('customer movie dateOut')
        .select('movie customer dateOut -_id');

    res.send(rentals);
});

router.post('/', authMiddleware, async (req, res) => {
    debug(Fawn);
    const { error } = validate(req.body);
    if (!!error) return res.status(400).send(error.details[0].message);

    let movie = await Movie.findById(req.body.movie);

    if (movie.numberInStock === 0) {
        return res.status(400).send("There's no more copies :(");
    }

    let customer = await Customer.findById(req.body.customer);

    let rental = new Rental({
        movie: movie._id,
        customer: customer._id,
        rentalFee: req.body.rentalFee
    });

    /*try{ rental = await rental.save(); }
    catch(err){ return res.status(400).send('Something went wrong'); }*/
    new Fawn.Task()
        .save('rentals', rental)
        //we have to pass actual name of the collection
        //which is plural, not singural, becouse we
        //are working with colleciton directly
        //it's case sensetive also
        .update(
            'movies',
            { _id: movie._id },
            {
                $inc: { numberInStock: -1 }
            }
        )
        //update movies collection, specifically value with given ID,
        //and increment it's property numberInStock by -1 - decrement
        //.remove() - przykladowa nastepna operacja
        .run();

    res.send(rental);
});

router.put('/:id', authMiddleware, async (req, res) => {
    const { error } = validate(req.body);
    if (!!error) return res.status(400).send(error.details[0].message);
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).send('Invalid id');

    let movie = await Movie.findById(req.body.movie);
    let customer = await Customer.findById(req.body.customer);

    const tempObj = {
        movie: movie._id,
        customer: customer._id,
        rentalFee: !!req.body.rentalFee ? req.body.rentalFee : undefined,
        dateReturned: !!req.body.dateReturned
            ? req.body.dateReturned
            : undefined,
        dateOut: !!req.body.dateOut ? req.body.dateOut : undefined
    };

    Object.keys(tempObj).forEach(
        key => tempObj[key] === undefined && delete tempObj[key]
    );

    let rental = await Rental.findOneAndUpdate(
        { _id: id },
        { ...tempObj },
        {
            new: true
        }
    );

    res.send(rental);
});

router.delete('/:id', authMiddleware, async (req, res) => {
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).send('Invalid id');

    let rental = await Rental.deleteOne({ _id: id });

    res.send(rental);
});

module.exports = router;
