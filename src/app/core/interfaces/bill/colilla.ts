export interface Colilla {
    idEmpresa: number;
    idFactura: number;
    valorFactura: number;
    fechaVencimiento: string;
    valorPago: number;
    usuarioCreacion?: string;
}

/** Un ítem individual que proviene del Excel: solo idFactura y valorPago */
export interface PagoItem {
    idFactura: number;
    valorPago: number;
}

/** Payload completo que espera la API (/validar-pagos y /procesar-pagos) */
export interface ColillasPayload {
    idEmpresa: number;
    usuarioCreacion: string;
    pagos: PagoItem[];
}

export interface EstadoColilla {
    id: number;
    nombre: string;
}

export interface DetalleValidacionColilla {
    idFactura: number;
    idEmpresa: number;
    estado: EstadoColilla;
    mensaje: string;
    valorFactura: number | null;
    valorPago: number | null;
    valorPendiente: number | null;
}

export interface ResponseValidacionColillas {
    totalRegistros: number;
    pagosCompletos: number;
    pagosParcialesAbono: number;
    registrosConError: number;
    detalle: DetalleValidacionColilla[];
}

export interface ApiResponseValidacionColillas {
    success: boolean;
    message: string;
    code: number;
    response: ResponseValidacionColillas;
}
