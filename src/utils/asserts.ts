export function ensureHasUser<T = unknown>(obj: {
  user?: T
}): asserts obj is { user: T } {
  if (obj.user === undefined) {
    throw new Error('No user in object')
  }
}
