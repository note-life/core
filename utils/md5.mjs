import crypto from 'crypto';

class MD5{
    static random(bytes = 156) {
        return crypto.randomBytes(bytes).toString('hex')
    }

    static file() {

    }
}

export default MD5;