// tracing: off

import type { Show } from "./definitions"

export function struct<O extends Record<string, any>>(
  shows: {
    [K in keyof O]: Show<O[K]>
  }
): Show<O> {
  return {
    show: (s) =>
      `{ ${Object.keys(shows)
        .map((k) => `${k}: ${shows[k]!.show(s[k])}`)
        .join(", ")} }`
  }
}

export function tuple<T extends ReadonlyArray<Show<any>>>(
  ...shows: T
): Show<
  {
    [K in keyof T]: T[K] extends Show<infer A> ? A : never
  }
> {
  return {
    show: (t) => `[${t.map((a, i) => shows[i]!.show(a)).join(", ")}]`
  }
}

export const boolean: Show<boolean> = {
  show: (a) => JSON.stringify(a)
}

export const number: Show<number> = {
  show: (a) => JSON.stringify(a)
}

export const string: Show<string> = {
  show: (a) => JSON.stringify(a)
}
