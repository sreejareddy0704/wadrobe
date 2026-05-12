import type { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AppError } from '../utils/AppError.js';

export class PlannerController {
  /**
   * Get all planned outfits for a user
   */
  static async getPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = 'mock-user-id'; 
      const plans = await prisma.outfitPlan.findMany({
        where: { userId },
        include: {
          outfit: {
            include: {
              items: {
                include: { clothingItem: true }
              }
            }
          }
        },
        orderBy: { date: 'asc' }
      });
      res.json(ApiResponse.success(plans));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new outfit plan
   */
  static async createPlan(req: Request, res: Response, next: NextFunction) {
    const { outfitId, date, notes } = req.body;
    const userId = 'mock-user-id';

    if (!outfitId || !date) {
      return next(new AppError('Outfit ID and Date are required', 400));
    }

    try {
      const plan = await prisma.outfitPlan.create({
        data: {
          userId,
          outfitId,
          date: new Date(date),
          notes
        }
      });
      res.status(201).json(ApiResponse.success(plan, 'Outfit planned successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a plan
   */
  static async deletePlan(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      await prisma.outfitPlan.delete({
        where: { id }
      });
      res.json(ApiResponse.success(null, 'Plan deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}
