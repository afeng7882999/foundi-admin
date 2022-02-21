// any object
export interface AnyObject {
  [key: string]: any
}

// any function
export interface AnyFunction {
  (...args: any[]): any
}

// function need implementation
export const needImplFunc: AnyFunction = (...args: any[]): any => {
  throw new Error('Function not implemented')
}
