import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    phoneNumber?: string;
    address?: string;
    cities?: string[];
    serviceCategories?: string[];
    description?: string;
    commercialRegistration?: string;
  };
  subscription?: any;
}

export interface SubscriptionRequest extends Request {
  subscription?: any;
} 