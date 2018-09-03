const mongoose = require('mongoose');
const express = require('express');
const debug = require('debug')('app:startup');
const config = require('config');
require('dotenv').config();
const home = require('./routes/home');
const genres = require('./routes/genres');
const customers = require('./routes/customers');
const movies = require('./routes/movies');
const rentals = require('./routes/rentals');

mongoose.connect(config.get('connectionString'), { useNewUrlParser: true })
    .then(() => debug('Connected to MongoDB Vidly'))
    .catch((err) => debug('Something went wrong', err))

const app = express();
app.use(express.json())
app.use('/', home);
app.use('/api/genres/', genres);
app.use('/api/customers/', customers);
app.use('/api/movies/', movies);
app.use('/api/rentals/', rentals);

const port = process.env.PORT || 3000;
app.listen(port, () => debug(`Listening to HTTP request on port ${port}`))