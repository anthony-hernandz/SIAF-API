import { estadoAct } from "./entities/ambiente.entity";

export interface IAmbientesResponse{
    id: string;
    nombre: string;
    registro: string; 
    estado: estadoAct;
    motivo_inactivar: string;
    es_nuevo: boolean;
}

export interface IAmbientesPaginatedResponse{
    ambiente: IAmbientesResponse[];
    pagination: {
        limit: number,
        offset: number,
        total: number,
    };
}

export interface IAmbienteActivar{
    aceptar: boolean,
}

export interface IAmbienteDesactivar{
    justificacion: string,
}