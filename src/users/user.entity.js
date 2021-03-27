const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Role = require("../commons/util").Role;

const Schema = mongoose.Schema;

const schema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minLength : 4,
    },

    password: {
        type: String,
        required: true,
    },

    firstName: {
        type: String,
        required: true,
    },

    lastName: {
        type: String,
        required: true,
    },

    role:{
        type: String,
        required: true,
        default: "customer",
        enum : Object.keys(Role),
    },

    isLocked: {
        type: Boolean,
        required: true,
        default:false,
    },

    successiveFailedLogins : {
        type: Number,
        required:true,
        default:0,
    }

}, {collection : 'users'});

schema.pre('save', function(next) {
    if(this.isModified('password')) {
        const salt = bcrypt.genSaltSync();
        this.password = bcrypt.hashSync(this.password, salt);
    }

    this.firstName = this.firstName.trim();
    this.lastName = this.lastName.trim();

    next();
})

module.exports = mongoose.model('User', schema);