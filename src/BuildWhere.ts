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
  onField: (field: string) => string,
  params = {},
): Promise<[string, object]> => {
  if (Object.keys(where).length != 1) {
    const [keys, values] = [Object.keys(where), Object.values(where)];
    const $and: {}[] = [];
    for (const index in keys) {
      $and.push({ [keys[index]]: values[index] });
    }
    return BuildWhere({ $and }, onField, params);
  }

  const [key, value] = [Object.keys(where)[0], Object.values(where)[0]];
  // object keywords
  switch (key) {
    case '$and': {
      const sqlFilters: string[] = [];
      for (const filter of value) {
        const [sql, anotherParams] = await BuildWhere(filter, onField, params);
        if (sql.length) sqlFilters.push(sql);
        params = { ...params, ...anotherParams };
      }
      return [`(${sqlFilters.join(' AND ')})`, params];
    }
    case '$or': {
      const sqlFilters: string[] = [];
      for (const filter of value) {
        const [sql, anotherParams] = await BuildWhere(filter, onField, params);
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
      let match: WhereStructure<T>;
      if (typeof value === 'string') {
        match = { $eq: value };
      } else {
        match = value;
      }

      const [sql, anotherParams] = await BuildWhere(match, onField, params);
      return [`((${onField(key)}) ${sql})`, anotherParams];
    }
  }
};
