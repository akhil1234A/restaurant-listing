import { CustomRequest } from '../../core/types/express';

export interface PaginationParams {
  page: number;
  limit: number;
  searchTerm?: string;
}

export interface PaginatedResponse<T> {
  data: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Extracts pagination parameters from request query
 * @param req CustomRequest
 * @returns PaginationParams
 */
export function getPaginationParams(req: CustomRequest): PaginationParams {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const searchTerm = req.query.search as string | undefined;

  return { page, limit, searchTerm };
}

/**
 * Formats pagination response
 * @param data The data to return
 * @param page Current page number
 * @param limit Items per page
 * @param total Total number of items
 * @returns PaginatedResponse
 */
export function formatPaginatedResponse<T>(
  data: T,
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}