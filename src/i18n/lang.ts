export type Lang = 'zh' | 'en' | 'es' | 'ja'

export const SUPPORTED: Lang[] = ['zh', 'en', 'es', 'ja']

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'zh', label: '中' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'ja', label: '日' },
]

/** localStorage key for a manually chosen language (overrides detection). */
export const LANG_STORAGE_KEY = 'bg-lang'

/** Match a BCP-47 tag (e.g. "zh-CN", "es-419") to a supported base language. */
export function matchLang(code: string | null | undefined): Lang | null {
  const base = (code ?? '').toLowerCase().split('-')[0]
  return SUPPORTED.includes(base as Lang) ? (base as Lang) : null
}

export function resolveLang(code: string | undefined): Lang {
  return matchLang(code) ?? 'en'
}

/**
 * Initial language: a previously chosen language if saved, otherwise English
 * (the default for everyone). The user can switch with the toggle.
 */
export function detectInitialLang(): Lang {
  if (typeof localStorage !== 'undefined') {
    const saved = matchLang(localStorage.getItem(LANG_STORAGE_KEY))
    if (saved) return saved
  }
  return 'en'
}

/** A translatable field. zh + en are required; es/ja fall back to en. */
export interface Localized {
  zh: string
  en: string
  es?: string
  ja?: string
}

export function tr(field: Localized, lang: Lang): string {
  return field[lang] ?? field.en
}

export function teamLabel(team: { name: Localized; short?: Localized }, lang: Lang): string {
  return tr(team.short ?? team.name, lang)
}
