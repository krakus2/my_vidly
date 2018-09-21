const winston = require('winston');
require('winston-mongodb');
require('express-async-errors');

module.exports = function() {
    process.on('uncaughtException', ex => {
        debug('WE GOT UNCAUGHT EXCEPTION');
        winston.error(ex.message, ex);
    });

    process.on('unhandledRejection', ex => {
        debug('WE GOT UNHANDLED REJECTION');
        winston.error(ex.message, ex);
        process.exit(1);
    });

    winston.add(winston.transports.File, { filename: 'logfile.log' });
    winston.add(winston.transports.MongoDB, {
        db: 'mongodb://localhost/vidly',
        level: 'error'
    });
};
