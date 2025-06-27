import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

export class UnaccentFactory implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    await dataSource.query(`CREATE EXTENSION IF NOT EXISTS unaccent;`);
  }
}
