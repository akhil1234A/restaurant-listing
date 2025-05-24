import { Request } from 'express';
import { RestaurantDTO } from '../dtos/restaurant.dto';

export interface PaginationParams {
  page: number;
  limit: number;
  searchTerm?: string;
}

export interface PaginatedResponse<T> {
  restaurants: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function getPaginationParams(req: Request): PaginationParams {
  return {
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 10,
    searchTerm: req.query.search as string | undefined,
  };
}

export function formatPaginatedResponse<T>(
  restaurants: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  return {
    restaurants,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}