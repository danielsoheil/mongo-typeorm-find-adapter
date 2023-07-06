import { it, expect, beforeEach, afterEach } from '@jest/globals';
import { User, UserFactory } from './models/User';
import AppDataSource from './DataSource';
import { RoleFactory } from './models/Role';
import { MongoFind } from '../index';

beforeEach(async () => {
  await AppDataSource.initialize();
  await AppDataSource.synchronize();
});

afterEach(async () => {
  await AppDataSource.destroy();
});

it('should filter on one level relation', async function () {
  const Users = AppDataSource.getRepository(User);

  // create some user
  for (const _ of [...Array(10)]) {
    await new UserFactory(AppDataSource).create();
  }
  await new UserFactory(AppDataSource).create({
    firstName: 'alireza',
    lastName: 'bahrani',
    creator: await new UserFactory(AppDataSource).create({
      firstName: 'daniel',
      lastName: 'soheil',
    }),
  });

  const qb = Users.createQueryBuilder('entity');
  qb.setFindOptions({ relations: { creator: true } });
  const mongoFind = new MongoFind(qb);
  await mongoFind.where({ 'creator.lastName': { $like: '%soh%' } });
  const [users, total] = await qb.getManyAndCount();

  expect(users).toMatchObject([
    expect.objectContaining({ firstName: 'alireza', lastName: 'bahrani' }),
  ]);
});

it('should filter on two level relation', async function () {
  const Users = AppDataSource.getRepository(User);

  // create some user
  for (const _ of [...Array(10)]) {
    await new UserFactory(AppDataSource).create();
  }
  await new UserFactory(AppDataSource).create({
    firstName: 'alireza',
    lastName: 'bahrani',
    role: await new RoleFactory(AppDataSource).create({
      title: 'Developer',
      creator: await new UserFactory(AppDataSource).create({
        firstName: 'mostafa',
        lastName: 'ebrahimi',
      }),
    }),
  });

  const qb = Users.createQueryBuilder('entity');
  qb.setFindOptions({ relations: { role: { creator: true } } });
  const mongoFind = new MongoFind(qb);
  await mongoFind.where({ 'role.creator.firstName': { $eq: 'mostafa' } });
  const [users, total] = await qb.getManyAndCount();

  expect(users).toMatchObject([
    expect.objectContaining({ firstName: 'alireza', lastName: 'bahrani' }),
  ]);
});
