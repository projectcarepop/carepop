import { Request } from 'express';

export interface IUser {
  id: string;
  roles: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  file?: any;
} 