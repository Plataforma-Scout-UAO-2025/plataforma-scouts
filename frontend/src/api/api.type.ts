export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Filtros base reutilizables
export interface BaseFilters {
  search?: string;
  page?: number;
  limit?: number;
}

// Tipos comunes para estadísticas
export interface BaseStats {
  total: number;
  [key: string]: number | Record<string, number>;
}
