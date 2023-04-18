import { Router } from 'express';

import AuthRoutes from '../../interfaces/routes/v1/auth';
import UsersRoutes from '../../interfaces/routes/v1/users';
import BlogRoutes from '../../interfaces/routes/v1/blogs';
import AuthenticationMiddleware from "../../interfaces/middlewares/AuthenticationMiddleware";

const router = Router();

router.use('/auth', AuthRoutes);
router.use('/users', UsersRoutes);
router.use('/blogs', AuthenticationMiddleware(), BlogRoutes);

export default router;
