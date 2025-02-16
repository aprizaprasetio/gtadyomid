import type { Session } from 'lucia'

declare module 'hono' {
  interface ContextVariableMap {
    session: Session | null
  }
}
