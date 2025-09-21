import { estadoAct } from "./entities/estado_fisico_activo.entity";

export interface IEstadoFisicoActivo{
    id: string;
    nombre: string;
    registro: string; 
    estado: estadoAct;
    motivo_inactivar: string;
    es_nuevo: boolean;
}

export interface IEstadoFisicoActivoPaginatedResponse{
    estadoFisicoActivo: IEstadoFisicoActivo[];
        pagination: {
            limit: number,
            offset: number,
            total: number,
        };
}

export interface IEstadoFisicoActivoActivado{
    aceptar: boolean,
}

export interface IEstadoFisicoActivoDescativar{
    justificacion: string,
}