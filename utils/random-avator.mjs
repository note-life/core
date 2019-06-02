import crypto from 'crypto'
import Identicon from 'identicon.js'

function randomAvator (str = Date.now(), type = 'base64') {
    const hash = crypto.createHash('md5');

    return 'data:image/png;base64,' + new Identicon(hash.update(`${str}`).digest('hex'), 120).toString();
}

export default randomAvator;
