import { BuildWhere, WhereStructure } from './BuildWhere';
export { BuildWhere } from './BuildWhere';
import { FindOneOptions, ObjectLiteral, Repository } from 'typeorm';
import { DriverUtils } from 'typeorm/driver/DriverUtils';
import AppDataSource from './test/DataSource';

export class ReadQueryBuilder<T extends ObjectLiteral> {
  #repo: Repository<T>;

  #where: WhereStructure<T> = {};
  #relations: FindOneOptions<T>['relations'] = undefined;
  #order: FindOneOptions['order'] = undefined;
  #select: FindOneOptions<T>['select'] = undefined;

  constructor(repo: Repository<T>) {
    this.#repo = repo;
  }

  where(i: WhereStructure<T>) {
    this.#where = i;
    return this;
  }

  relation(i: FindOneOptions<T>['relations']) {
    this.#relations = i;
    return this;
  }

  order(i: FindOneOptions<T>['order']) {
    this.#order = i;
    return this;
  }

  select(i: FindOneOptions<T>['select']) {
    this.#select = i;
    return this;
  }

  async exec(skip: number, limit: number) {
    const qb = this.#repo.createQueryBuilder('entity');

    qb.setFindOptions({
      select: this.#select,
      order: this.#order,
      relations: this.#relations,
      skip,
      take: limit,
    });

    const joinAlias = (alias: string, propertyPath: string) =>
      alias + '_' + propertyPath.replace('.', '_');

    const onField = (field: string) => {
      field = `entity.${field}`;
      const splitedField = field.split('.');

      // if we have relation
      if (splitedField.length > 1) {
        // generete the alias like typeorm
        let alias: string | undefined;
        for (const index in splitedField) {
          const Index = parseInt(index);
          const nextIndex = parseInt(index) + 1;
          if (Index <= splitedField.length - 2) {
            alias ??= splitedField[index];
            const propertyPath = splitedField[nextIndex];
            if (Index == splitedField.length - 2) {
              alias += '.' + propertyPath;
            } else {
              alias = DriverUtils.buildAlias(
                AppDataSource.driver,
                { joiner: '__' },
                alias,
                joinAlias(alias, propertyPath),
              );
            }
          }
        }
        if (alias) field = alias;
      }

      return field;
    };

    const [sql, params] = await BuildWhere(this.#where, onField);
    qb.where(sql, params);

    return qb.getManyAndCount();
  }
}
