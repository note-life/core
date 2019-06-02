import Router from 'koa-router';
import { user } from '../controller';

const router = new Router();

router.get('/', user.get);
router.get('/:id', user.get);
router.post('/', user.create);
router.put('/:id', user.edit);
router.del('/:id', user.del);
router.del('/', user.del);

router.post('/revoke', user.revoke);
router.post('/authenticate', user.authenticate);
router.post('/forget', user.forget);

export default router;