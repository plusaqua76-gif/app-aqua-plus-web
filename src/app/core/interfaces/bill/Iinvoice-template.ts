export interface InvoiceTemplate {
  id?: number; 
  descripcion: string;
  contenido: string;
  codigo: string;
  usuarioCreacion: string;
  empresa: {
    id: number;
  };
}


export interface InvoiceTemplateResponse {
  id: number;
  descripcion: string;
  contenido: string;
  codigo: string;
}

export interface InvoiceTemplateApiResponse {
  success: boolean;
  message: string;
  code: number;
  totalCount: number;
  response: InvoiceTemplateResponse[];
}
