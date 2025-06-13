import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    id: string;
    name: string;
    email: string;
    type: 'customer' | 'provider' | 'admin';
  };
} 