import { authHandlers } from './auth'
import { notesHandlers } from './notes'

export const handlers = [...authHandlers, ...notesHandlers]
