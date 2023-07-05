import { it, expect, beforeEach } from "@jest/globals";
import { ReadQueryBuilder } from "../index";
import { User, UserFactory } from "./models/User";
import AppDataSource from "./DataSource";

beforeEach(async () => {
  await AppDataSource.initialize();
});

it("should filter on one level relation", async function () {
  const Users = AppDataSource.getRepository(User);

  // create some user
  for (const _ of [...Array(10)]) {
    await new UserFactory(AppDataSource).create();
  }
  await new UserFactory(AppDataSource).create({
    firstName: "alireza",
    lastName: "bahrani",
    creator: await new UserFactory(AppDataSource).create({
      firstName: "daniel",
      lastName: "soheil",
    }),
  });

  const [users, total] = await new ReadQueryBuilder(Users)
    .relation({ creator: true })
    .where({ "creator.lastName": { $like: "%soh%" } })
    .exec(0, 10);

  expect(users).toMatchObject([
    expect.objectContaining({ firstName: "alireza", lastName: "bahrani" }),
  ]);
});
