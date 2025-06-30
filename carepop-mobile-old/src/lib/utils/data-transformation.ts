// A simple, recursive function to convert object keys from snake_case to camelCase.
export const keysToCamel = <T>(obj: any): T => {
  if (Array.isArray(obj)) {
    return obj.map(v => keysToCamel(v)) as any;
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (acc, key) => {
        const camelKey = key.replace(/([-_][a-z])/gi, ($1) =>
          $1.toUpperCase().replace('-', '').replace('_', '')
        );
        acc[camelKey] = keysToCamel(obj[key]);
        return acc;
      },
      {} as any
    );
  }
  return obj;
}; 