import { Router } from 'express';
import { WardrobeController } from '../controllers/WardrobeController.js';
import { upload } from '../config/cloudinary.js';

const router = Router();

// Get all clothing items for a user
router.get('/', WardrobeController.getItems);

// Upload image and get auto-tags
router.post('/upload', upload.single('image'), WardrobeController.uploadAndTag);

// Manual auto-tag an existing item
router.post('/auto-tag', WardrobeController.autoTag);

// Add new clothing item
router.post('/', WardrobeController.createItem);

export default router;
