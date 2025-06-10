import { Response } from 'express';

interface SuccessResponsePayload<T> {
  message?: string;
  data?: T;
  statusCode?: number;
}

export const sendSuccess = <T>(
  res: Response,
  payload: SuccessResponsePayload<T>
) => {
  const { message = 'Success', data = null, statusCode = 200 } = payload;
  
  const response = {
    status: 'success',
    message,
    data,
  };

  res.status(statusCode).json(response);
}; 