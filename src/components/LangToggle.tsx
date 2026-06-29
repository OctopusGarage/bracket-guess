import { useTranslation } from 'react-i18next'
import { LANG_STORAGE_KEY, LANGS, resolveLang } from '../i18n/lang'

export default function LangToggle() {
  const { i18n } = useTranslation()
  const current = resolveLang(i18n.language)

  const choose = (code: string) => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, code)
    } catch {
      // private mode / storage disabled — the choice just won't persist
    }
    i18n.changeLanguage(code)
  }

  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          className={`lang-toggle__opt${l.code === current ? ' is-active' : ''}`}
          aria-pressed={l.code === current}
          onClick={() => choose(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
