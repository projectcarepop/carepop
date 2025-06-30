import { camelCase, snakeCase } from 'lodash';

type AnyObject = { [key: string]: any };

/**
 * A simple utility to convert snake_case strings to camelCase.
 * e.g., 'first_name' becomes 'firstName'
 * @param str The string to convert.
 * @returns The camelCased string.
 */
const toCamel = (str: string): string => {
  return str.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
};

// Recursively converts object keys to a specific case.
const convertCase = (obj: any, converter: (key: string) => string): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => convertCase(v, converter));
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const newKey = converter(key);
      result[newKey] = convertCase(obj[key], converter);
      return result;
    }, {} as AnyObject);
  }
  return obj;
};

export const keysToCamel = <T>(obj: any): T => {
  return convertCase(obj, camelCase) as T;
};

export const keysToSnake = <T>(obj: any): T => {
  return convertCase(obj, snakeCase) as T;
}; 