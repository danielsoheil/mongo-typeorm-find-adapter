import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { DriverUtils } from 'typeorm/driver/DriverUtils';

const joinAlias = (alias: string, propertyPath: string) =>
  alias + '_' + propertyPath.replace('.', '_');

export const alias = <T extends ObjectLiteral>(
  field: string,
  queryBuilder: SelectQueryBuilder<T>,
) => {
  field = `${queryBuilder.alias}.${field}`;
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
            queryBuilder.connection.driver,
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
