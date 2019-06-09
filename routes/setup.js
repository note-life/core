const Router = require('koa-router');
const setup = require('../controller/setup');

const router = new Router();

router.post('/db', setup.db);
router.post('/admin', setup.admin);

module.exports = router;
