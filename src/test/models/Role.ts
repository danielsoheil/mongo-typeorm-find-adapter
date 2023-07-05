import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Relation,
} from "typeorm";
import {Factory} from "@danielsoheil/typeorm-better-factory";
import { faker } from "@faker-js/faker";
import {User} from "./User";

@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @ManyToOne(() => User, { nullable: true })
    creator: Relation<User>;
}

export class RoleFactory extends Factory<Role> {
    entity = Role;

    title = faker.person.jobTitle();
    creator = null;
}
