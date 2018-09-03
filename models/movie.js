const Joi = require('joi');
const mongoose = require('mongoose');
const { genreSchema } = require('./genre');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
        minlength: 3,
        maxlength: 150,
        trim: true
    },
    genre: {
        type: genreSchema,
        require: true
    },
    numberInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    }
})

const Movie = mongoose.model('movie', movieSchema); //call without new

function validateMovie(movie){
    const schema = {
        title: Joi.string().min(3).max(150).required(),
        genreId: Joi.string().required(), //to jest zwykły string, a nie obiekt, bo 
        //w http request bedziemy podawac tylko id danego gatunku 
        numberInStock: Joi.number().min(0).max(12).required(),
        dailyRentalRate: Joi.number().min(0).max(12).required()
    }

    return Joi.validate(movie, schema);
}

exports.Movie = Movie;
exports.validate = validateMovie;
