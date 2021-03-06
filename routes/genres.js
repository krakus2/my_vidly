const express = require('express');
const debug = require('debug')('app:startup');
const router = express.Router();
const { Genre, validate } = require('../models/genre');
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
    let genres = await Genre.find().sort({ name: 1 });
    res.send(JSON.stringify(genres));
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const genres = await Genre.findById(id)
        .sort({ name: 1 })
        .select('-_id');
    res.send(genres);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (!!error) {
        return res.status(400).send(error.details[0].message);
    } //albo robimy error handling tutaj, albo za pomocą try catch i schema
    let genre = new Genre({ name: req.body.name });
    genre = await genre.save();

    res.send(genre);
});

router.put('/:id', authMiddleware, async (req, res) => {
    const { error } = validate(req.body);
    if (!!error) {
        return res.status(400).send(error.details[0].message);
    }
    const { id } = req.params;
    let genre = await Genre.findByIdAndUpdate(
        id,
        { name: req.body.name },
        {
            new: true //to get an updated object from the database
        }
    );
    res.send(genre);
});

router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    let genre = await Genre.deleteOne({ _id: id });
    res.send(genre);
});

module.exports = router;
