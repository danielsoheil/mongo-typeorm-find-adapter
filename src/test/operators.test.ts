import { it, expect, beforeEach, afterEach } from "@jest/globals";
import { ReadQueryBuilder } from "../index";
import { User, UserFactory } from "./models/User";
import AppDataSource from "./DataSource";

beforeEach(async () => {
  await AppDataSource.initialize();
  await AppDataSource.synchronize();
});

afterEach(async () => {
  await AppDataSource.destroy();
})

it("should filter with $eq", async function () {
  const Users = AppDataSource.getRepository(User);

  // create some user
  for (const _ of [...Array(10)]) {
    await new UserFactory(AppDataSource).create();
  }
  await new UserFactory(AppDataSource).create({
    firstName: "daniel",
    lastName: "soheil",
  });

  {
    const [users, total] = await new ReadQueryBuilder(Users)
      .relation({ creator: true })
      .where({
        firstName: { $eq: "daniel" },
      })
      .exec(0, 10);

    expect(users).toMatchObject([
      expect.objectContaining({ firstName: "daniel", lastName: "soheil" }),
    ]);
  }
  {
    const [users, total] = await new ReadQueryBuilder(Users)
      .relation({ creator: true })
      .where({
        firstName: { $eq: "xxxxxx" },
      })
      .exec(0, 10);

    expect(users).toMatchObject([]);
  }
});

it("should filter with $like", async function () {
  const Users = AppDataSource.getRepository(User);

  // create some user
  for (const _ of [...Array(10)]) {
    await new UserFactory(AppDataSource).create();
  }
  await new UserFactory(AppDataSource).create({
    firstName: "daniel",
    lastName: "soheil",
  });

  {
    const [users, total] = await new ReadQueryBuilder(Users)
      .relation({ creator: true })
      .where({
        firstName: { $like: "%dani%" },
      })
      .exec(0, 10);

    expect(users).toMatchObject([
      expect.objectContaining({ firstName: "daniel", lastName: "soheil" }),
    ]);
  }
  {
    const [users, total] = await new ReadQueryBuilder(Users)
      .relation({ creator: true })
      .where({
        firstName: { $like: "%xxxxxx%" },
      })
      .exec(0, 10);

    expect(users).toMatchObject([]);
  }
});

it("should filter with $or", async function () {
  const Users = AppDataSource.getRepository(User);

  // create some user
  for (const _ of [...Array(10)]) {
    await new UserFactory(AppDataSource).create();
  }
  await new UserFactory(AppDataSource).create({
    firstName: "daniel",
    lastName: "soheil",
  });

  {
    const [users, total] = await new ReadQueryBuilder(Users)
      .relation({ creator: true })
      .where({
        $or: [
          {
            firstName: { $eq: "xxxxxx" },
          },
          {
            lastName: { $eq: "soheil" },
          },
        ],
      })
      .exec(0, 10);

    expect(users).toMatchObject([
      expect.objectContaining({ firstName: "daniel", lastName: "soheil" }),
    ]);
  }
  {
    const [users, total] = await new ReadQueryBuilder(Users)
      .relation({ creator: true })
      .where({
        $or: [
          {
            firstName: { $eq: "daniel" },
          },
          {
            lastName: { $eq: "xxxxxx" },
          },
        ],
      })
      .exec(0, 10);

    expect(users).toMatchObject([
      expect.objectContaining({ firstName: "daniel", lastName: "soheil" }),
    ]);
  }
});

it("should filter with $and", async function () {
  const Users = AppDataSource.getRepository(User);

  // create some user
  for (const _ of [...Array(10)]) {
    await new UserFactory(AppDataSource).create();
  }
  await new UserFactory(AppDataSource).create({
    firstName: "daniel",
    lastName: "soheil",
  });

  {
    const [users, total] = await new ReadQueryBuilder(Users)
      .relation({ creator: true })
      .where({
        $and: [
          {
            firstName: { $eq: "daniel" },
          },
          {
            lastName: { $eq: "soheil" },
          },
        ],
      })
      .exec(0, 10);

    expect(users).toMatchObject([
      expect.objectContaining({ firstName: "daniel", lastName: "soheil" }),
    ]);
  }
  {
    const [users, total] = await new ReadQueryBuilder(Users)
      .relation({ creator: true })
      .where({
        $and: [
          {
            firstName: { $eq: "daniel" },
          },
          {
            lastName: { $eq: "xxxxxx" },
          },
        ],
      })
      .exec(0, 10);

    expect(users).toMatchObject([]);
  }
});
