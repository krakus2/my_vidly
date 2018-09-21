const mongoose = require('mongoose');
const Joi = require('Joi');
const { isEmail } = require('validator')
const config = require('config');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'User name is required',
        minlength: 3,
        maxlength: 40,
        trim: true,
        unique: true
    },
    email: {
        type: String,//mongoose.SchemaTypes.Email,
        required: 'Email adress is required',
        unique: true,
        trim: true,
        validate:{
            validator: isEmail,
            message: '{VALUE} is not a valid email address',
            isAsync: false
        }
    },
    password: {
        type: String,
        required: 'Password is required',
        minlength: 8,
        maxlength: 255,
        trim: true,
    },
})

userSchema.methods.generateAuthToken = function(){ 
    //trzeba to dodac do methods, a pozniej wywolac prosto z User
    return jwt.sign({ _id: this._id }, config.get('jwtPrivateKey'));
}
const User = mongoose.model('user', userSchema);

function validateUser(user){
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    const schema = {
        name: Joi.string().min(3).max(40).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(40)
            .regex(regex, 'password verification').required(),
    };

    return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;
