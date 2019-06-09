const crypto = require('crypto');

class MD5{
    static random(bytes = 156) {
        return crypto.randomBytes(bytes).toString('hex')
    }

    static file() {

    }
}

module.exports = MD5;
