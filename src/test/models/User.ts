import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { Factory, SubFactory } from '@danielsoheil/typeorm-better-factory';
import { faker } from '@faker-js/faker';
import { Role, RoleFactory } from './Role';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Role, { nullable: true })
  role: Relation<Role>;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @ManyToOne(() => User, { nullable: true })
  creator: Relation<User>;
}

export class UserFactory extends Factory<User> {
  entity = User;

  role = new SubFactory(RoleFactory);
  firstName = faker.person.firstName();
  lastName = faker.person.lastName();
  creator = null;
}
