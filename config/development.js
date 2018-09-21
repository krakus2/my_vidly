require('dotenv').config();

module.exports = {
    "connectionString": "mongodb://localhost/vidly",
    'jwtPrivateKey': process.env.JWTPRIVATEKEY
}