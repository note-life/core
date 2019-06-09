const Router = require('koa-router');
const { verification } = require('../controller');

const router = new Router();

router.get('/code', verification.sendCode);

module.exports = router;
