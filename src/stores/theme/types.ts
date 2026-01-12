/**
 * 테마 관련 타입 정의
 */

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeColors {
  primary: string
  background: string
  text: string
  textSecondary: string
  border: string
  error: string
  success: string
}

export interface ThemeState {
  mode: ThemeMode
  resolvedTheme: 'light' | 'dark'
}

export interface ThemeActions {
  setMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

export type ThemeStore = ThemeState & ThemeActions
