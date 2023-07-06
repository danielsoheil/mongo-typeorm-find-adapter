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

it('should filter with $eq', async function () {
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
    await mongoFind.where( {
      firstName: { $eq: 'daniel' },
    });
    const [users, total] = await qb.getManyAndCount();

    expect(users).toMatchObject([
      expect.objectContaining({ firstName: 'daniel', lastName: 'soheil' }),
    ]);
  }
  {
    const qb = Users.createQueryBuilder('entity');
    qb.setFindOptions({ relations: { creator: true } });
    const mongoFind = new MongoFind(qb);
    await mongoFind.where( {
      firstName: { $eq: 'xxxxxx' },
    });
    const [users, total] = await qb.getManyAndCount();

    expect(users).toMatchObject([]);
  }
});

it('should filter with $like', async function () {
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
    await mongoFind.where( {
      firstName: { $like: '%dani%' },
    });
    const [users, total] = await qb.getManyAndCount();

    expect(users).toMatchObject([
      expect.objectContaining({ firstName: 'daniel', lastName: 'soheil' }),
    ]);
  }
  {
    const qb = Users.createQueryBuilder('entity');
    qb.setFindOptions({ relations: { creator: true } });
    const mongoFind = new MongoFind(qb);
    await mongoFind.where( {
      firstName: { $like: '%xxxxxx%' },
    });
    const [users, total] = await qb.getManyAndCount();

    expect(users).toMatchObject([]);
  }
});

it('should filter with $or', async function () {
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
    await mongoFind.where( {
      $or: [
        {
          firstName: { $eq: 'xxxxxx' },
        },
        {
          lastName: { $eq: 'soheil' },
        },
      ],
    });
    const [users, total] = await qb.getManyAndCount();

    expect(users).toMatchObject([
      expect.objectContaining({ firstName: 'daniel', lastName: 'soheil' }),
    ]);
  }
  {
    const qb = Users.createQueryBuilder('entity');
    qb.setFindOptions({ relations: { creator: true } });
    const mongoFind = new MongoFind(qb);
    await mongoFind.where( {
      $or: [
        {
          firstName: { $eq: 'daniel' },
        },
        {
          lastName: { $eq: 'xxxxxx' },
        },
      ],
    });
    const [users, total] = await qb.getManyAndCount();

    expect(users).toMatchObject([
      expect.objectContaining({ firstName: 'daniel', lastName: 'soheil' }),
    ]);
  }
});

it('should filter with $and', async function () {
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
    await mongoFind.where( {
      $and: [
        {
          firstName: { $eq: 'daniel' },
        },
        {
          lastName: { $eq: 'soheil' },
        },
      ],
    });
    const [users, total] = await qb.getManyAndCount();

    expect(users).toMatchObject([
      expect.objectContaining({ firstName: 'daniel', lastName: 'soheil' }),
    ]);
  }
  {
    const qb = Users.createQueryBuilder('entity');
    qb.setFindOptions({ relations: { creator: true } });
    const mongoFind = new MongoFind(qb);
    await mongoFind.where( {
      $and: [
        {
          firstName: { $eq: 'daniel' },
        },
        {
          lastName: { $eq: 'xxxxxx' },
        },
      ],
    });
    const [users, total] = await qb.getManyAndCount();

    expect(users).toMatchObject([]);
  }
});
