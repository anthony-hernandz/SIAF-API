import { DataSource } from 'typeorm';
import { runSeeder, Seeder } from 'typeorm-extension';
import {
  PermisosFactory,
  RolsFactory,
  UnaccentFactory,
  UsersFactory,
} from './factories';

export default class InitialSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    await runSeeder(dataSource, RolsFactory);
    await runSeeder(dataSource, UsersFactory);
    await runSeeder(dataSource, UnaccentFactory);
    await runSeeder(dataSource, PermisosFactory);
  }
}
