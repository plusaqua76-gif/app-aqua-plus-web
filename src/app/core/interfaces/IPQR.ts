export interface IPQR {
  id: number;
  tipo: 'Petición' | 'Queja' | 'Reclamo' | 'Sugerencia';
  cliente: string;
  documento: string;
  descripcion: string;
  fecha: string;
  estado: 'Pendiente' | 'En Proceso' | 'Resuelto' | 'Cerrado';
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  respuesta?: string;
  archivos?: string[];
  empresaId?: number;
  clienteId?: number;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  usuarioCreacion?: string;
  usuarioActualizacion?: string;
}

export interface IPQRFiltros {
  estado?: string;
  tipo?: string;
  prioridad?: string;
  cliente?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface IPQRRespuesta {
  pqrId: number;
  respuesta: string;
  estado: 'En Proceso' | 'Resuelto' | 'Cerrado';
  usuario: string;
  fecha: Date;
}
