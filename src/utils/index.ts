import { AnyFunction } from '@/types/global'

export const needImplFunc: AnyFunction = (...args: any[]): any => {
  throw new Error('Function not implemented')
}
