import assert from 'assert';
import { DataSource } from 'typeorm';
import { User } from './models/User';
import { Role } from './models/Role';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const { DB_URL, DB_ENABLE_LOGGING, DB_DROP_SCHEMA } = process.env;

assert(DB_URL, 'DB_URL env is required');

const AppDataSource = new DataSource({
  type: 'postgres',
  url: DB_URL,
  synchronize: false,
  logging: DB_ENABLE_LOGGING === 'true',
  dropSchema: true,
  entities: [User, Role],
  subscribers: [],
  migrations: ['migrations/*.ts'],
  namingStrategy: new SnakeNamingStrategy(),
  connectTimeoutMS: 10000,
});

export default AppDataSource;
