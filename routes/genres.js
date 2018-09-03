const mongoose = require('mongoose');
const express = require('express');
const debug = require('debug')('app:startup');
const router = express.Router();
const { Genre, validate } = require('../models/genre');

router.get('/', async (req, res) => {
    let genres;
    try{
        genres = await Genre
            .find()
            .sort({ name: 1 })
    }
    catch(err){
        return debug(err)
    }
    res.send(JSON.stringify(genres));
})

router.get('/:id', async (req, res) => {
    let genres;
    const { id } = req.params
    try{
        genres = await Genre
            .findById(id)
            .sort({ name: 1 })
            .select('-_id')
    }
    catch(err){
        return debug(err)
    }
    res.send(genres);
})

router.post('/', async (req, res) => {
    const { error } = validate(req.body)
    if(!!error){
        return res.status(400).send(error.details[0].message)
    } //albo robimy error handling tutaj, albo za pomocą try catch i schema
    let genre = new Genre({ name: req.body.name })
    genre = await genre.save();

    res.send(genre)
})

router.put('/:id', async(req, res) => {
    const { error } = validate(req.body)
    if(!!error){
        return res.status(400).send(error.details[0].message)
    }
    const { id } = req.params
    let genre;
    try{
        genre = await Genre.findByIdAndUpdate(id, { name: req.body.name }, {
            new: true //to get an updated object from the database
        })
    }
    catch(err){
        return debug(err);
    }

    res.send(genre)
})

router.delete('/:id', async(req, res) => {
    const { id } = req.params
    let genre;
    try{
        genre = await Genre.deleteOne({ _id: id });
    }
    catch(err){
        return debug(err);
    }
    res.send(genre)
})

module.exports = router;

