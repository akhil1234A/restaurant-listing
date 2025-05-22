export interface QueryParams {
  page: number;
  limit: number;
  searchTerm?: string;
}

export const getQueryParams = (query: any): QueryParams => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const searchTerm = typeof query.search === 'string' ? query.search : undefined;

  return { page, limit, searchTerm };
};