import type { Request, Response } from 'express';
import { navigationService } from '../../services/navigation.service';
import { AppError } from '../../utils/errors';

class NavigationController {
  public async getDirections(req: Request, res: Response): Promise<void> {
    const { origin, destination, mode } = req.body;

    // Basic validation, since Zod validation is in the route
    if (!origin || !destination || !mode) {
      throw new AppError('Origin, destination, and mode are required.', 400);
    }

    const directions = await navigationService.getDirections(origin, destination, mode);

    if (directions.status !== 'OK') {
        throw new AppError(`Directions API Error: ${directions.status}`, 400);
    }

    res.status(200).json({
      status: 'success',
      data: directions.routes,
    });
  }
}

export const navigationController = new NavigationController();