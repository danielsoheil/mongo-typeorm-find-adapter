import { it, expect, beforeEach } from "@jest/globals";
import { ReadQueryBuilder } from "../index";
import { User } from "./models/User";
import AppDataSource from "./DataSource";

beforeEach(async () => {
  await AppDataSource.initialize();
});

it("should filter on one level relation", async function () {
  const Users = AppDataSource.getRepository(User);

  // create some user
  await Users.save({ firstName: "hosein", lastName: "noshadi" });
  const creator = await Users.save({ firstName: "daniel", lastName: "soheil" });
  await Users.save({ firstName: "alireza", lastName: "bahrani", creator });
  await Users.save({ firstName: "pardis", lastName: "basiri" });
  await Users.save({ firstName: "mona", lastName: "asadi" });

  const [users, total] = await new ReadQueryBuilder(Users)
    .relation({ creator: true })
    .where({ "creator.lastName": { $like: "%soh%" } })
    .exec(0, 10);

  expect(users).toMatchObject([
    expect.objectContaining({ firstName: "alireza", lastName: "bahrani" }),
  ]);
});
