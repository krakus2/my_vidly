const mongoose = require('mongoose');
const express = require('express');
const { Movie, validate } = require('../models/movie');
const { Genre } = require('../models/genre');
const debug = require('debug')('app:startup');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
    let movies = await Movie.find();

    res.send(movies);
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    let movie = await Movie.findById(id);

    res.send(movie);
});

router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { error } = validate(req.body);
    if (!!error) return res.status(400).send('Invalid genre');

    let genre = await Genre.findById(req.body.genreId);
    let movie = await Movie.updateOne(
        { _id: id },
        {
            $set: {
                title: req.body.title,
                genre: {
                    _id: genre._id,
                    name: genre.name
                },
                numberInStock: req.body.numberInStock,
                dailyRentalRate: req.body.dailyRentalRate
            }
        }
    );

    res.send(movie);
});

router.post('/', authMiddleware, async (req, res) => {
    const { error } = validate(req.body);
    if (!!error) return res.status(400).send('Invalid movie');
    let genre = await Genre.findById(req.body.genreId);

    let movie = new Movie({
        title: req.body.title,
        genre: {
            _id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    });

    movie = await movie.save();
    res.send(movie);
});

router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    let movie = await Movie.deleteOne({ _id: id });

    res.send(movie);
});

module.exports = router;
