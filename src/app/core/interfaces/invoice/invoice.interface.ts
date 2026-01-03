export interface EnterpriceInvoice {
  useAlegraCertificate: boolean;
  notificationByEmail: {
    enabled: boolean;
  };
  address: {
    city: string;
    department: string;
    country: string;
    address: string;
  };
  regimeCode: string;
  identificationType: string;
  name: string;
  identification: string;
  tradeName: string;
  dv: string;
  type: string;
  email: string;
  phone: string;
}


export interface EnterpriceInvoiceResponse {
  company: {
    id: string;
    name: string;
    tradeName: string;
    identification: string;
    dv: string;
    type: string;
    useAlegraCertificate: boolean;
    governmentStatus: Record<string, unknown>;
    notificationByEmail: {
      enabled: boolean;
    };
    webhooks: Record<string, unknown>;
    identificationType: string;
    regimeCode: string;
    email: string;
    phone: string;
    address: {
      address: string;
      city: string;
      department: string;
      country: string;
    };
  };
}

export interface SetTest {
  company: {
    id: string;
  };
  type: string;
  governmentId: string;
}

export interface SetTestResponse {
  errors?: {
    code: string;
    message: string;
    httpCode: number;
  }[];
  approvedTestSet?: {
    id: string;
    governmentId: string;
    type: string;
    status: string;
  };
}

export interface ResponseValueCode {
  code: string;
  value: string;
}


export interface Municipality {
  id: number;
  code: string;
  value: string;
  departmentCode: string;
  departmentValue: string;
}


export interface ResolutionDian {
  numero: string;
  prefijo: string;
  numeroMinimo: number;
  numeroMaximo: number;
  numeroActual: number;
  fechaInicio: string;
  fechaFin: string;
  claveTecnica: string;
  empresa: {
    id: number;
  };
  activo: boolean;
  usuarioCreacion: string;
}

export interface ResponseResolutionDian {
  id: number;
  numero: string;
  prefijo: string;
  numeroMinimo: number;
  numeroMaximo: number;
  numeroActual: number;
  fechaInicio: string;
  fechaFin: string;
  claveTecnica: string;
  empresa: {
    id: number;
    usuario: {
      id: number;
      rol: {
        id: number;
        nombre: string;
        usuarioCreacion: string;
      };
      estado: {
        id: number;
        nombre: string;
      };
      nombre: string;
      contrasena: string;
      activo: boolean;
      usuarioCreacion: string;
      usuarioModificacion: string;
    };
    direccion: {
      id: number;
      departamento: {
        id: number;
        nombre: string;
      };
      ciudad: {
        id: number;
        nombre: string;
        activo: boolean;
        usuarioCreacion: string;
      };
      corregimiento: {
        id: number;
        nombre: string;
      };
      descripcion: string;
      usuarioCreacion: string;
    };
    nombre: string;
    nit: string;
    codigo: string;
    activo: boolean;
    usuarioCreacion: string;
    fechaCreacion: string;
    usuarioModificacion: string;
    fechaModificacion: string;
    idEmpresaDian: string;
  };
}

