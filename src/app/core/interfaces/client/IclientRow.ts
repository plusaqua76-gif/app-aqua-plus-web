export interface ClientRow {
  id: number;
  numeroIdentificacion: string;
  nombreCliente: string;
  telefono: string;
  vereda: string;
  direccion: string;
  correo: string;
  estado: boolean;

  direccionCompleta?: {
    id: number;
    departamento: { id: number; nombre: string };
    ciudad: { id: number; nombre: string };
    corregimiento: { id: number; nombre: string };
    descripcion: string;
  };
  tipoDocumento?: {
    id: number;
    nombre: string;
    codigo: string;
  };
  nombre?: string;
  segundoNombre?: string;
  apellido?: string;
  segundoApellido?: string;
  codigo?: string | null;
}
