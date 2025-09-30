export const PQR_CONFIG = {
  // Mapeo de códigos de estado de la API a estados PQR
  ESTADO_MAPPING: {
    'EST_PEN': 'Pendiente' as const,
    'EST_PRO': 'En Proceso' as const,
    'EST_RES': 'Resuelto' as const,
    'EST_CER': 'Cerrado' as const
  },

  // Mapeo inverso de estados PQR a IDs de estado de la API
  ESTADO_ID_MAPPING: {
    'Pendiente': 1,
    'En Proceso': 2,
    'Resuelto': 3,
    'Cerrado': 4
  },

  // Mapeo de tipos de novedad a prioridades
  PRIORIDAD_MAPPING: {
    'Tubo roto': 'Alta' as const,
    'Fuga': 'Urgente' as const,
    'Medidor dañado': 'Alta' as const,
    'Sin servicio': 'Urgente' as const,
    'Baja presión': 'Media' as const,
    'Mal sabor': 'Media' as const,
    'Facturación': 'Baja' as const,
    'Instalación': 'Media' as const,
    'Mantenimiento': 'Media' as const,
    'Reparación': 'Alta' as const,
    'Suspensión': 'Urgente' as const,
    'Reconexión': 'Alta' as const,
    'Default': 'Media' as const
  },

  // Colores para badges de estado
  ESTADO_COLORS: {
    'Pendiente': 'bg-yellow-100/10 text-yellow-400 border border-yellow-400/20',
    'En Proceso': 'bg-blue-100/10 text-blue-400 border border-blue-400/20',
    'Resuelto': 'bg-green-100/10 text-green-400 border border-green-400/20',
    'Cerrado': 'bg-gray-100/10 text-gray-400 border border-gray-400/20'
  },

  // Colores para badges de prioridad
  PRIORIDAD_COLORS: {
    'Baja': 'bg-gray-100/10 text-gray-400 border border-gray-400/20',
    'Media': 'bg-yellow-100/10 text-yellow-400 border border-yellow-400/20',
    'Alta': 'bg-orange-100/10 text-orange-400 border border-orange-400/20',
    'Urgente': 'bg-red-100/10 text-red-400 border border-red-400/20'
  },

  // Colores para badges de tipo (basado en tipo de novedad)
  TIPO_COLORS: {
    'Tubo roto': 'bg-red-100/10 text-red-400 border border-red-400/20',
    'Fuga': 'bg-red-100/10 text-red-400 border border-red-400/20',
    'Medidor dañado': 'bg-orange-100/10 text-orange-400 border border-orange-400/20',
    'Sin servicio': 'bg-red-100/10 text-red-400 border border-red-400/20',
    'Baja presión': 'bg-yellow-100/10 text-yellow-400 border border-yellow-400/20',
    'Mal sabor': 'bg-yellow-100/10 text-yellow-400 border border-yellow-400/20',
    'Facturación': 'bg-blue-100/10 text-blue-400 border border-blue-400/20',
    'Instalación': 'bg-green-100/10 text-green-400 border border-green-400/20',
    'Mantenimiento': 'bg-blue-100/10 text-blue-400 border border-blue-400/20',
    'Reparación': 'bg-orange-100/10 text-orange-400 border border-orange-400/20',
    'Suspensión': 'bg-red-100/10 text-red-400 border border-red-400/20',
    'Reconexión': 'bg-green-100/10 text-green-400 border border-green-400/20',
    'Default': 'bg-gray-100/10 text-gray-400 border border-gray-400/20'
  }
};

export type EstadoPQR = keyof typeof PQR_CONFIG.ESTADO_MAPPING;
export type EstadoNombre = typeof PQR_CONFIG.ESTADO_MAPPING[EstadoPQR];
export type PrioridadNombre = keyof typeof PQR_CONFIG.PRIORIDAD_COLORS;
