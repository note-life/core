import Router from 'koa-router';
import setup from '../controller/setup';

const router = new Router();

router.post('/db', setup.db);
router.post('/admin', setup.admin);

export default router;