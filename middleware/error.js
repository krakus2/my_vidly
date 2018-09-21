const winston = require('winston');

module.exports = function(err, req, res, next){
    winston.error(err.message);
    res.status(500).send(`Something failed\n${err}`)
}
//async middleware (factory function) przekazuje w pipeline robote tutaj
//ten middleware jest w index.js zaimplementowany po routingu
// - zeby kolejnosc byla dobra