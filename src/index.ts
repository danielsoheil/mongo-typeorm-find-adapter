import { BuildWhere, WhereStructure } from './BuildWhere';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { alias } from './hook/alias';

export class MongoFind<T extends ObjectLiteral> {
  queryBuilder: SelectQueryBuilder<T>;

  constructor(queryBuilder: SelectQueryBuilder<T>) {
    this.queryBuilder = queryBuilder;
  }

  private getOnFieldHook() {
    return (f: string): string => {
      f = alias(f, this.queryBuilder);
      return f;
    };
  }

  async where<T extends ObjectLiteral>(where: WhereStructure<T>) {
    const [sql, params] = await BuildWhere(where, this.getOnFieldHook());
    this.queryBuilder.where(sql, params);
  }

  async andWhere<T extends ObjectLiteral>(where: WhereStructure<T>) {
    const [sql, params] = await BuildWhere(where, this.getOnFieldHook());
    this.queryBuilder.andWhere(sql, params);
  }

  async orWhere<T extends ObjectLiteral>(where: WhereStructure<T>) {
    const [sql, params] = await BuildWhere(where, this.getOnFieldHook());
    this.queryBuilder.orWhere(sql, params);
  }
}
