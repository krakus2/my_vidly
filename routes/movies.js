const mongoose = require('mongoose');
const express = require('express');
const { Movie, validate } = require('../models/movie');
const { Genre } = require('../models/genre');
const debug = require('debug')('app:startup');

const router = express.Router();

router.get('/', async(req, res) => {
    let movies;
    try{
        movies = await Movie
            .find()
    }
    catch (err){
        debug(err)
    }
})

router.get('/:id', async(req, res) => {
    const { id } = req.params;
    let movie;
    try{
        movie = await Movie.findById(id);
    }
    catch(err){
        debug(err);
    }
    res.send(movie);
})

router.put('/:id', async(req, res) => {
    const { id } = req.params;
    let movie;
    let genre;
    const { error } = validate(req.body)
    if(!!error) return res.status(400).send("Invalid genre");

    try{ genre = await Genre.findById(req.body.genreId) }
    catch(err){ return debug(err); }

    try{
        movie = await Movie.updateOne({ _id: id}, {
            $set: {
                title: req.body.title,
                genre: {
                    _id: genre._id,
                    name: genre.name
                },
                numberInStock: req.body.numberInStock,
                dailyRentalRate: req.body.dailyRentalRate
            }
        })
    }
    catch(err){ return debug(err); }

    res.send(movie);
})

router.post('/', async(req, res) => {
    let genre;
    const { error } = validate(req.body)
    if(!!error) return res.status(400).send("Invalid movie");

    try{ genre = await Genre.findById(req.body.genreId) }
    catch(err){ return debug(err); }

    console.log(genre)

    let movie = new Movie({
        title: req.body.title,
        genre: {
            _id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    })

    try{ movie = await movie.save(); }
    catch(err){ return debug(err); }

    res.send(movie);
})

router.delete('/:id', async(req, res) => {
    const { id } = req.params;
    let movie;
    try{
       movie = await Movie.deleteOne({_id: id})
    }
    catch(err) { return debug(err); }

    res.send(movie);
})

module.exports = router;