import { Router } from 'express';
import { OutfitController } from '../controllers/OutfitController.js';

const router = Router();

// Get all outfits for a user
router.get('/', OutfitController.getOutfits);

// Generate a new outfit using AI
router.post('/generate', OutfitController.generateOutfit);

// Create a new outfit (save to DB)
router.post('/', OutfitController.createOutfit);

export default router;
