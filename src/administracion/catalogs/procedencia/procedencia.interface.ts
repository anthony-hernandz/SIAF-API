import { estadoAct } from "./entities/procedencia.entity";

export interface IProcedencia{
    id: string;
    nombre: string;
    registro: string; 
    estado: estadoAct;
    motivo_inactivar: string;
    es_nuevo: boolean;
}

export interface IProcedenciaPaginatedResponse{
    procedencia: IProcedencia[];
    pagination: {
        limit: number,
        offset: number,
        total: number,
    };
}

export interface IProcedenciaActivado{
    aceptar: boolean,
}

export interface IProcedenciaDescativar{
    justificacion: string,
}