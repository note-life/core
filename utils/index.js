const connectToMongoose = require('./db');
const mailTo = require('./mail');
const tokenSecret = require('./token-secret');
const psd = require('./psd');
const randomAvator = require('./random-avator');

module.exports = {
    connectToMongoose,
    mailTo,
    tokenSecret,
    psd,
    randomAvator
};
