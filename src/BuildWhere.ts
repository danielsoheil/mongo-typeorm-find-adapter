type field = { $eq: string } | { $like: string };
export type WhereStructure<T> =
  | { [K in keyof T]: field }
  | { $and: WhereStructure<T>[] }
  | { $or: WhereStructure<T>[] }
  | object;

const generateKey = async () => {
  return (await import("crypto")).randomBytes(20).toString("hex").slice(0, 10);
};

export const BuildWhere = async <T>(
  filter: WhereStructure<T>,
  params = {}
): Promise<[string, object]> => {
  const keys = Object.keys(filter);
  const values = Object.values(filter);
  const filters: string[] = [];

  if (!keys.length || !values.length) return ["", {}];

  // object keywords
  switch (keys[0]) {
    case "$and": {
      const sqlFilters: string[] = [];
      for (const filter of values[0]) {
        const [sql, anotherParams] = await BuildWhere(filter);
        if (sql.length) sqlFilters.push(sql);
        params = { ...params, ...anotherParams };
      }
      return [`(${sqlFilters.join(" AND ")})`, params];
    }
    case "$or": {
      const sqlFilters: string[] = [];
      for (const filter of values[0]) {
        const [sql, anotherParams] = await BuildWhere(filter);
        if (sql.length) sqlFilters.push(sql);
        params = { ...params, ...anotherParams };
      }
      return [`(${sqlFilters.join(" OR ")})`, params];
    }
    case "$eq": {
      const paramkey = await generateKey();
      return [`= :${paramkey}`, { [paramkey]: values[0] }];
    }
    case "$like": {
      const paramkey = await generateKey();
      return [`like :${paramkey}`, { [paramkey]: values[0] }];
    }
    default: {
      const [sql, params] = await BuildWhere(values[0]);
      if (!keys[0].includes(".")) {
        return [`((entity.${keys[0]}) ${sql})`, params];
      } else {
        return [`((entity__entity_${keys[0]}) ${sql})`, params];
      }
    }
  }

  return ["", {}];
};
