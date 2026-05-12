import type { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client.js';
import axios from 'axios';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AppError } from '../utils/AppError.js';
import { uploadImage } from '../utils/cloudinary.js';
import { getCache, setCache, clearCachePattern } from '../utils/redis.js';
import { config } from '../config/config.js';

export class WardrobeController {
  /**
   * Get all clothing items for a user
   */
  static async getItems(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = 'mock-user-id'; 
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
      const skip = (page - 1) * limit;

      const cacheKey = `wardrobe:${userId}:p${page}:l${limit}`;

      const cachedData = await getCache(cacheKey);
      if (cachedData) {
        return res.json(ApiResponse.success(cachedData, 'Items fetched from cache'));
      }

      const [items, total] = await Promise.all([
        prisma.clothingItem.findMany({
          where: { userId },
          skip,
          take: limit,
          include: { tags: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.clothingItem.count({ where: { userId } })
      ]);

      const responseData = {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };

      await setCache(cacheKey, responseData, 3600);
      res.json(ApiResponse.success(responseData));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload image and get auto-tags
   */
  static async uploadAndTag(req: Request, res: Response, next: NextFunction) {
    if (!req.file) {
      return next(new AppError('No image uploaded', 400));
    }

    try {
      // 1. Upload to Cloudinary
      let imageUrl: string;
      if (config.cloudinary.apiSecret === 'PLACEHOLDER_ADD_YOUR_SECRET') {
        console.log('[Mock]: Cloudinary not configured, using mock image URL');
        imageUrl = 'https://images.unsplash.com/photo-1591047139829-d91aec36adca?q=80&w=500';
      } else {
        imageUrl = await uploadImage(req.file.buffer);
      }

      // 2. Call AI service for auto-tagging
      let aiData;
      try {
        const aiResponse = await axios.post(`${config.aiServiceUrl}/auto-tag?image_url=${encodeURIComponent(imageUrl)}`);
        aiData = aiResponse.data;
      } catch (aiError) {
        console.warn('[AI Service Warning]: AI services unavailable, using fallback tags');
        aiData = {
          category: 'TOP',
          color: 'Neutral',
          occasion: 'CASUAL',
          season: 'ALL_SEASON',
          tags: [{ name: 'minimal' }, { name: 'staple' }]
        };
      }
      
      // 3. Clear cache
      await clearCachePattern(`wardrobe:mock-user-id*`);

      res.json(ApiResponse.success({
        imageUrl,
        ...aiData
      }));
    } catch (error) {
      console.error('Upload Error:', error);
      next(new AppError('Failed to process image upload', 500));
    }
  }

  /**
   * Manual auto-tag an existing item
   */
  static async autoTag(req: Request, res: Response, next: NextFunction) {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return next(new AppError('Image URL is required', 400));
    }

    try {
      const response = await axios.post(`${config.aiServiceUrl}/auto-tag?image_url=${encodeURIComponent(imageUrl)}`);
      res.json(ApiResponse.success(response.data));
    } catch (error) {
      next(new AppError('AI auto-tagging failed', 500));
    }
  }

  /**
   * Add new clothing item
   */
  static async createItem(req: Request, res: Response, next: NextFunction) {
    const { imageUrl, category, color, brand, season, occasion, tags } = req.body;
    const userId = 'mock-user-id';

    if (!imageUrl || !category) {
      return next(new AppError('Image URL and Category are required', 400));
    }

    try {
      const newItem = await prisma.clothingItem.create({
        data: {
          userId,
          imageUrl,
          category,
          color,
          brand,
          season,
          occasion,
          tags: {
            connectOrCreate: (tags || []).map((tag: string) => ({
              where: { name: tag },
              create: { name: tag }
            }))
          }
        }
      });

      // Clear cache
      await clearCachePattern(`wardrobe:${userId}*`);

      res.status(201).json(ApiResponse.success(newItem, 'Item created successfully'));
    } catch (error) {
      next(error);
    }
  }
}
