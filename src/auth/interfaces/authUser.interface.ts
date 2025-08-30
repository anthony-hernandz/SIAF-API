export interface IAuthUser {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
  tipo_usuario: {
    id: string;
    nombre: string;
  };
}
