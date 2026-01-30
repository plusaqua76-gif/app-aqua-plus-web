export interface CarouselEmpresa {
  empresaId: number;
  nombreEmpresa: string;
  contentType: string;
}

export interface CarouselResponse {
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  items: CarouselEmpresa[];
}

export interface CarouselApiResponse {
  success: boolean;
  message: string;
  code: number;
  totalCount: number;
  response: CarouselResponse;
}
