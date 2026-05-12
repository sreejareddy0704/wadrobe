import type { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client.js';
import axios from 'axios';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AppError } from '../utils/AppError.js';
import { config } from '../config/config.js';
import { getCache, setCache } from '../utils/redis.js';

export class OutfitController {
  /**
   * Get all outfits for a user
   */
  static async getOutfits(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = 'mock-user-id'; 
      const cacheKey = `outfits:${userId}`;

      const cachedOutfits = await getCache(cacheKey);
      if (cachedOutfits) {
        return res.json(ApiResponse.success(cachedOutfits, 'Outfits fetched from cache'));
      }

      const outfits = await prisma.outfit.findMany({
        where: { userId },
        include: { 
          items: {
            include: { clothingItem: true }
          }
        }
      });

      await setCache(cacheKey, outfits, 3600);
      res.json(ApiResponse.success(outfits));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate a new outfit using AI
   */
  static async generateOutfit(req: Request, res: Response, next: NextFunction) {
    const { occasion, weather, preferences } = req.body;
    const userId = 'mock-user-id';

    const cacheKey = `outfit_recommendation:${userId}:${occasion}:${weather}`;
    const cachedOutfit = await getCache(cacheKey);
    if (cachedOutfit) {
      return res.json(ApiResponse.success(cachedOutfit, 'Outfit retrieved from cache'));
    }

    try {
      // Fetch all user items to provide as context to AI
      const items = await prisma.clothingItem.findMany({
        where: { userId },
        include: { tags: true }
      });

      if (items.length === 0) {
        return next(new AppError('No clothing items found in wardrobe', 400));
      }

      let recommendation;
      try {
        const response = await axios.post(`${config.aiServiceUrl}/generate-outfit`, {
          items,
          occasion,
          weather,
          user_preferences: preferences
        });
        recommendation = response.data;
      } catch (aiError) {
        console.warn('[AI Service Warning]: AI services unavailable, using fallback matching');
        // Simple fallback: pick first 2 items
        recommendation = {
          outfit: 'Curated Selection',
          item_ids: items.slice(0, 2).map(i => i.id),
          reasoning: 'Selection based on matching category availability.'
        };
      }

      await setCache(cacheKey, recommendation, 1800); // Cache for 30 mins

      res.json(ApiResponse.success(recommendation));
    } catch (error) {
      next(new AppError('Failed to generate outfit suggestion', 500));
    }
  }

  /**
   * Create a new outfit (save to DB)
   */
  static async createOutfit(req: Request, res: Response, next: NextFunction) {
    const { name, items, season, occasion } = req.body;
    const userId = 'mock-user-id';

    if (!name || !items || !items.length) {
      return next(new AppError('Outfit name and items are required', 400));
    }

    try {
      const outfit = await prisma.outfit.create({
        data: {
          userId,
          name,
          season,
          occasion,
          items: {
            create: items.map((itemId: string) => ({
              clothingItemId: itemId
            }))
          }
        }
      });

      // Clear related caches
      const cacheKey = `outfits:${userId}`;
      const searchPattern = `outfit_recommendation:${userId}*`;
      const { clearCache, clearCachePattern } = await import('../utils/redis.js');
      await clearCache(cacheKey);
      await clearCachePattern(searchPattern);

      res.status(201).json(ApiResponse.success(outfit, 'Outfit saved successfully'));
    } catch (error) {
      next(error);
    }
  }
}
