import { it, expect, beforeEach } from "@jest/globals";
import assert from "assert";
import { DataSource } from "typeorm";
import { ReadQueryBuilder } from "../index";
import { User } from "./User";

const { DB_URL, DB_ENABLE_LOGGING, DB_DROP_SCHEMA } = process.env;

assert(DB_URL, "DB_URL env is required");

const AppDataSource = new DataSource({
  type: "postgres",
  url: DB_URL,
  synchronize: true,
  logging: DB_ENABLE_LOGGING === "true",
  dropSchema: DB_DROP_SCHEMA === "true",
  entities: [User],
  subscribers: [],
  migrations: ["migrations/*.ts"],
  connectTimeoutMS: 10000,
});

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
