import { Response } from 'express';

export const sendSuccess = <T>(res: Response, data: T, statusCode: number = 200) => {
  res.status(statusCode).json({
    status: 'success',
    data,
  });
};

export const sendCreated = <T>(res: Response, data: T) => {
    sendSuccess(res, data, 201);
};

export const sendNoContent = (res: Response) => {
    res.status(204).send();
} 