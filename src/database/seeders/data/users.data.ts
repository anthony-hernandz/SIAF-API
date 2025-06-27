interface IUsersSeed {
  id: string;
  email: string;
  password: string;
  active: boolean;
  idRol: string;
}

export const UsersSeed: IUsersSeed[] = [
  {
    id: '1',
    email: 'admin@salud.gob.sv',
    password: 'admin',
    active: true,
    idRol: '1',
  },
];
