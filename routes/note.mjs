import Router from 'koa-router';
import { note } from '../controller';

const router = new Router();

router.get('/', note.get);
router.get('/:id', note.get);
router.post('/', note.create);
router.put('/:id', note.edit);
router.del('/:id', note.del);
router.del('/', note.del);

export default router;