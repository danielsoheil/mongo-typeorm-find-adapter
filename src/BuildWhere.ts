type field = { $eq: string } | { $like: string };
export type WhereStructure<T> =
  | { [K in keyof T]: field }
  | { $and: WhereStructure<T>[] }
  | { $or: WhereStructure<T>[] }
  | object;

const generateKey = async () => {
  return (await import('crypto')).randomBytes(20).toString('hex').slice(0, 10);
};

export const BuildWhere = async <T>(
  where: WhereStructure<T>,
  changeField: (field: string) => string = (f) => f,
  params = {},
): Promise<[string, object]> => {
  const key = Object.keys(where)[0];
  const value = Object.values(where)[0];

  // object keywords
  switch (key) {
    case '$and': {
      const sqlFilters: string[] = [];
      for (const filter of value) {
        const [sql, anotherParams] = await BuildWhere(
          filter,
          changeField,
          params,
        );
        if (sql.length) sqlFilters.push(sql);
        params = { ...params, ...anotherParams };
      }
      return [`(${sqlFilters.join(' AND ')})`, params];
    }
    case '$or': {
      const sqlFilters: string[] = [];
      for (const filter of value) {
        const [sql, anotherParams] = await BuildWhere(
          filter,
          changeField,
          params,
        );
        if (sql.length) sqlFilters.push(sql);
        params = { ...params, ...anotherParams };
      }
      return [`(${sqlFilters.join(' OR ')})`, params];
    }
    case '$eq': {
      const paramkey = await generateKey();
      return [`= :${paramkey}`, { [paramkey]: value }];
    }
    case '$like': {
      const paramkey = await generateKey();
      return [`like :${paramkey}`, { [paramkey]: value }];
    }
    default: {
      const [sql, anotherParams] = await BuildWhere(value, changeField, params);

      return [`((${changeField(key)}) ${sql})`, anotherParams];
    }
  }
};
