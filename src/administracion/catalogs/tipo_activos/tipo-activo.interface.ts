
export interface ITipoActivo{
    id: string;
    nombre: string;
    registro: string; 
    active: boolean;
}

export interface ITipoActivoPaginatedResponse{
    tipoactivo: ITipoActivo[];
    pagination: {
        limit: number,
        offset: number,
        total: number,
    };
}