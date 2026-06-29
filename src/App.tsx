import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { RouterProvider } from 'react-router-dom'
import { resolveLang } from './i18n/lang'
import { router } from './router'

export default function App() {
  const { t, i18n } = useTranslation()

  // Keep the browser tab title and <html lang> in sync with the active language.
  useEffect(() => {
    document.title = t('app.docTitle')
    document.documentElement.lang = resolveLang(i18n.language)
  }, [t, i18n.language])

  return <RouterProvider router={router} />
}
