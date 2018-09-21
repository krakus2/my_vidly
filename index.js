const express = require('express');
const winston = require('winston');
require('dotenv').config();
const app = express();

require('./startup/logging.js');
require('./startup/routes.js')(app);
require('./startup/db.js')();
require('./startup/config.js')();

const port = process.env.PORT || 3000;
app.listen(port, () =>
    winston.info(`Listening to HTTP request on port ${port}`)
);
