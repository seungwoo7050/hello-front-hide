import type { ApiError } from './client'

export type ApiErrorListener = (error: ApiError) => void

const listeners = new Set<ApiErrorListener>()

export function subscribeToApiErrors(listener: ApiErrorListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function emitApiError(error: ApiError): void {
  listeners.forEach((listener) => listener(error))
}
