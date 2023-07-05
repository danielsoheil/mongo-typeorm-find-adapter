import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from "typeorm";
import { Factory } from "@danielsoheil/typeorm-better-factory";
import { faker } from "@faker-js/faker";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @ManyToOne(() => User, { nullable: true })
  creator: Relation<User>;
}

export class UserFactory extends Factory<User> {
  entity = User;

  firstName = faker.person.firstName();
  lastName = faker.person.lastName();
  creator = null;
}
