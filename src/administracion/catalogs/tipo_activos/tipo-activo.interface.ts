import { estadoAct } from "./entities/tipo_activo.entity";

export interface ITipoActivo{
    id: string;
    nombre: string;
    registro: string; 
    estado: estadoAct;
    motivo_inactivar: string;
    es_nuevo: boolean;
}

export interface ITipoActivoPaginatedResponse{
    tipoactivo: ITipoActivo[];
    pagination: {
        limit: number,
        offset: number,
        total: number,
    };
}

export interface ITipoActivoActivado{
    aceptar: boolean,
}

export interface ITipoActivoDescativar{
    justificacion: string,
}