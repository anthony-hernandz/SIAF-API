import { estadoAct } from "./entities/caracteristica.entity";

export interface ICaracteristicasResponse{
    id: string;
    nombre: string;
    tipoActivo:{
        id: string,
        nombre: string,
    }
    registro: string; 
    estado: estadoAct;
    motivo_inactivar: string;
    es_nuevo: boolean;
}

export interface ICaracteristicasPaginatedResponse{
    caracteristicas: ICaracteristicasResponse[];
    pagination: {
        limit: number,
        offset: number,
        total: number,
    };
}

export interface ICaracteristicaActivado{
    aceptar: boolean,
}

export interface ICaracteristicaDescativar{
    justificacion: string,
}