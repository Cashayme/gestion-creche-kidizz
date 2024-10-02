import { DataSource } from 'typeorm';
import { User } from './src/user/user.entity';
import { Daycare } from './src/child-care/child-care.entity';
import { Child } from './src/child/child.entity';

export default new DataSource({
  type: 'sqlite',
  database: './db/kidizz.db',
  entities: [User, Daycare, Child],
  migrations: ['src/migrations/*.ts'],
  synchronize: false
})
