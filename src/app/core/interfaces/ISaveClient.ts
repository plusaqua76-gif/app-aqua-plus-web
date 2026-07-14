// Interfaces para el request de guardar cliente

export interface TarifaContador {
  idContador: number;
  idTipoTarifa: number;
  aplica: boolean;
}

export interface AforoContador {
  idContador: number;
  idAforos: number[];
}

export interface SaveClientPayload {
  idEmpresa: number;
  idTipoDocumento: number;
  numeroCedula: string | number;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  telefono: string;
  correo: string;
  idDepartamento: number;
  idCiudad: number;
  idCorregimiento?: number | null;
  descripcionDireccion: string;
  idEmpleadoEmpresa: number;
  usuarioCreacion: string;

  // Propiedades para crear cliente con múltiples contadores (create-client)
  discapacidad?: boolean;
  contadoresIds?: number[];
  tarifasContador?: TarifaContador[];
  aforosContador?: AforoContador[];

  // Propiedades para crear cliente con un solo contador (create-counter)
  usuario?: string;
  idTipoContador?: number;
  serialContador?: string;
  direccionContador?: {
    idDepartamento: number;
    idCiudad: number;
    idCorregimiento: number | null;
    descripcionDireccion: string;
  };
}

// Interfaces para el response de guardar cliente

export interface DetalleContador {
  estado: string;
  idContador: number;
  idRutaEmpleado: number;
  idEmpresaClienteContador: number;
}

export interface TarifaClienteItem {
  aplica: boolean;
  idTipoTarifa: number;
}

export interface TarifasCliente {
  items: TarifaClienteItem[];
  insertados: number;
  actualizados: number;
}

export interface SaveClientResponse {
  detalle: DetalleContador[];
  message: string;
  idPersona?: number;
  idUsuario: number | null;
  statusCode: number;
  tarifasCliente: TarifasCliente;
  idEmpresaClienteContador: number;
  empresaClienteContadorIds: number[];
  notice?: string;
}

export interface TarifaContadorUpdate {
  idTipoTarifa: number;
  // Opcional: cuando se omite, el cambio aplica a la entrada base (nivel tarifa).
  idTipoConcepto?: number;
  aplica: boolean;
}

export interface UpdateClientPayload {
  idEmpresaClienteContador: number;
  usuarioCambio: string;
  tarifasContador?: TarifaContadorUpdate[];
  contadores?: Record<string, unknown>[];
  contadoresNuevos?: Record<string, unknown>[];
  aforosContador?: Record<string, unknown>[];
  idEmpleadoEmpresa?: number;
  [key: string]: unknown;
}
