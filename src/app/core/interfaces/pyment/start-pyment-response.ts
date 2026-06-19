export interface PymentResponse {
    referencia: string;
    montoCentavos: number;
    moneda: string;
    acceptance_token: string;
    clave_publica: string;
    firma: string;
}

