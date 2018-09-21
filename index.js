const express = require('express');
const debug = require('debug')('app:startup');
const config = require('config');
require('dotenv').config();
const app = express();

require('./startup/logging.js');
require('./startup/routes.js')(app);
require('./startup/db.js');

if (!config.get('jwtPrivateKey')) {
    console.error('FATAL ERROR: jwtPrivatKey is not defined');
    process.exit(1);
}

app.use(express.json());

const port = process.env.PORT || 3000;
app.listen(port, () => debug(`Listening to HTTP request on port ${port}`));
