import { BuildWhere, WhereStructure } from './BuildWhere';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { DriverUtils } from 'typeorm/driver/DriverUtils';
import AppDataSource from './test/DataSource';

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

export async function mongoWhere<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  where: WhereStructure<T>,
) {
  const [sql, params] = await BuildWhere(where, onField);
  queryBuilder.where(sql, params);
}

export async function andMongoWhere<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  where: WhereStructure<T>,
) {
  const [sql, params] = await BuildWhere(where, onField);
  queryBuilder.andWhere(sql, params);
}
