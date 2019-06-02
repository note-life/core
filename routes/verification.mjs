import Router from 'koa-router';
import { verification } from '../controller';

const router = new Router();

router.get('/code', verification.sendCode);

export default router;
