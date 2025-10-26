export interface ImageData {
  key: string;
  size: number;
  lastModified: string;
  url: string;
}

export interface ImageWithDimensions extends ImageData {
  width?: number;
  height?: number;
  isHorizontal?: boolean;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
