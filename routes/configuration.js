const Router = require('koa-router');
const { configuration } = require('../controller');

const router = new Router();

router.get('/', configuration.get);
router.get('/:id', configuration.get);
router.post('/', configuration.create);
router.put('/:id', configuration.edit);
router.del('/', configuration.del);

module.exports = router;
