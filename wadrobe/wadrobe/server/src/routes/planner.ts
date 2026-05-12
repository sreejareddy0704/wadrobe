import { Router } from 'express';
import { PlannerController } from '../controllers/PlannerController.js';

const router = Router();

router.get('/', PlannerController.getPlans);
router.post('/', PlannerController.createPlan);
router.delete('/:id', PlannerController.deletePlan);

export default router;
