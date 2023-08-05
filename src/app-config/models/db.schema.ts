export interface CollectionSchema {
  name: string;
  schema: Record<string, any>;
}

export function parser(schema: any) {
  const p = simpleType(schema);
  if (p !== '__UNKNOWN__') {
    return p;
  }

  return Object.entries(schema)
    .map(([key, value]) => {
      return { [key]: parser(value) };
    })
    .reduce((acc, curr) => ({ ...acc, ...curr }), {});
}

function simpleType(value: any) {
  if (value === null) {
    return null;
  }
  if (value === 'String') {
    return String;
  }
  if (value === 'Number') {
    return Number;
  }
  if (value === 'Boolean') {
    return Boolean;
  }
  if (value === 'Date') {
    return Date;
  }
  if (value === 'Date.now') {
    return Date.now();
  }
  return '__UNKNOWN__';
}
