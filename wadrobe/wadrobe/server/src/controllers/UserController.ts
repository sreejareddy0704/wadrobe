import type { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AppError } from '../utils/AppError.js';

export class UserController {
  /**
   * Get user profile data
   */
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = 'mock-user-id'; 
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: { items: true, outfits: true }
          }
        }
      });

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      res.json(ApiResponse.success(user));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    const userId = 'mock-user-id';
    const { name, image } = req.body;

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { name, image }
      });
      res.json(ApiResponse.success(updatedUser, 'Profile updated successfully'));
    } catch (error) {
      next(error);
    }
  }
}
