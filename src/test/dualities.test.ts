import { it, expect, beforeEach, afterEach } from '@jest/globals';
import { User, UserFactory } from './models/User';
import AppDataSource from './DataSource';
import { MongoFind } from '../index';

beforeEach(async () => {
  await AppDataSource.initialize();
  await AppDataSource.synchronize();
});

afterEach(async () => {
  await AppDataSource.destroy();
});

it('should filter with another thing just like $eq', async function () {
  const Users = AppDataSource.getRepository(User);

  // create some user
  for (const _ of [...Array(10)]) {
    await new UserFactory(AppDataSource).create();
  }
  await new UserFactory(AppDataSource).create({
    firstName: 'daniel',
    lastName: 'soheil',
  });

  {
    const qb = Users.createQueryBuilder('entity');
    qb.setFindOptions({ relations: { creator: true } });
    const mongoFind = new MongoFind(qb);
    await mongoFind.where({ firstName: 'daniel' });
    const [users, total] = await qb.getManyAndCount();

    expect(users).toMatchObject([
      expect.objectContaining({ firstName: 'daniel', lastName: 'soheil' }),
    ]);
  }
  {
    const qb = Users.createQueryBuilder('entity');
    qb.setFindOptions({ relations: { creator: true } });
    const mongoFind = new MongoFind(qb);
    await mongoFind.where({ firstName: 'xxxxxx' });
    const [users, total] = await qb.getManyAndCount();

    expect(users).toMatchObject([]);
  }
});

it('should filter with multiple keys in object (just like $and)', async function () {
  const Users = AppDataSource.getRepository(User);

  // create some user
  for (const _ of [...Array(10)]) {
    await new UserFactory(AppDataSource).create();
  }
  await new UserFactory(AppDataSource).create({
    firstName: 'daniel',
    lastName: 'soheil',
  });

  {
    const qb = Users.createQueryBuilder('entity');
    qb.setFindOptions({ relations: { creator: true } });
    const mongoFind = new MongoFind(qb);
    await mongoFind.where({ firstName: 'daniel', lastName: 'soheil' });
    const [users, total] = await qb.getManyAndCount();

    expect(users).toMatchObject([
      expect.objectContaining({ firstName: 'daniel', lastName: 'soheil' }),
    ]);
  }
  {
    const qb = Users.createQueryBuilder('entity');
    qb.setFindOptions({ relations: { creator: true } });
    const mongoFind = new MongoFind(qb);
    await mongoFind.where({ firstName: 'daniel', lastName: 'xxxxxx' });
    const [users, total] = await qb.getManyAndCount();

    expect(users).toMatchObject([]);
  }
});

it('should not filter with empty object', async function () {
  const Users = AppDataSource.getRepository(User);

  // create some user
  for (const _ of [...Array(10)]) {
    await new UserFactory(AppDataSource).create();
  }

  {
    const qb = Users.createQueryBuilder('entity');
    const mongoFind = new MongoFind(qb);
    await mongoFind.where({});
    const [users, total] = await qb.getManyAndCount();

    expect(users).toHaveLength(10);
  }
});
