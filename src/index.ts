import { BuildWhere, WhereStructure } from "./BuildWhere";
export { BuildWhere } from "./BuildWhere";
import { FindOneOptions, ObjectLiteral, Repository } from "typeorm";

export class ReadQueryBuilder<T extends ObjectLiteral> {
  #repo: Repository<T>;

  #where: WhereStructure<T> = {};
  #relations: FindOneOptions<T>["relations"] = undefined;
  #order: FindOneOptions["order"] = undefined;
  #select: FindOneOptions<T>["select"] = undefined;

  constructor(repo: Repository<T>) {
    this.#repo = repo;
  }

  where(i: WhereStructure<T>) {
    this.#where = i;
    return this;
  }

  relation(i: FindOneOptions<T>["relations"]) {
    this.#relations = i;
    return this;
  }

  order(i: FindOneOptions<T>["order"]) {
    this.#order = i;
    return this;
  }

  select(i: FindOneOptions<T>["select"]) {
    this.#select = i;
    return this;
  }

  async exec(skip: number, limit: number) {
    const qb = this.#repo.createQueryBuilder("entity");

    qb.setFindOptions({
      select: this.#select,
      order: this.#order,
      relations: this.#relations,
      skip,
      take: limit,
    });

    const [sql, params] = await BuildWhere(this.#where);
    qb.where(sql, params);

    return qb.getManyAndCount();
  }
}
