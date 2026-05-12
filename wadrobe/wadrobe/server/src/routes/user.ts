import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';

const router = Router();

router.get('/profile', UserController.getProfile);
router.patch('/profile', UserController.updateProfile);

export default router;
