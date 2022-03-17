class FoundiError extends Error {
  constructor(m: string) {
    super(m)
    this.name = 'FoundiError'
  }
}

export function throwError(scope: string, m: string): never {
  throw new FoundiError(`[${scope}] ${m}`)
}

export function debugWarn(scope: string, message: string): void {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(new FoundiError(`[${scope}] ${message}`))
  }
}
