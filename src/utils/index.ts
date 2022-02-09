// any object
export interface AnyObject {
  [key: string]: any
}

// any function
export interface AnyFunction {
  (...args: any[]): any
}

// declare type Recordable<T = any> = Record<string, T>;
// declare type ReadonlyRecordable<T = any> = {
//   readonly [key: string]: T;
// };
// declare type Indexable<T = any> = {
//   [key: string]: T;
// };

// function need implementation
export const needImplFunc: AnyFunction = (...args: any[]): any => {
  throw new Error('Function not implemented')
}
