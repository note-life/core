import crypto from 'crypto';

const randomSalt = () => crypto.randomBytes(256).toString('hex');

const encrypt = (password, salt = randomSalt()) => {
    if (!password) {
        return { password };
    }

    const saltPassword = `${password}-${salt}`;
    const sha256 = crypto.createHash('sha256');

    return {
        hash: sha256.update(saltPassword).digest('hex'),
        salt
    };
};

const equal = (password, salt, hash) => encrypt(password, salt).hash === hash;

export default {
    randomSalt,
    encrypt,
    equal
};