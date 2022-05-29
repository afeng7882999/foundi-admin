export type Indexable<T = any> = {
  [key: string]: T
}

export type Recordable<T = any> = Record<string, T>

export type Nullable<T> = T | null

export type RefElement = Nullable<HTMLElement>

export type AnyFunction<T = any> = (...args: any[]) => T
