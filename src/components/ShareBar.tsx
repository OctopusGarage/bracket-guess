import { useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import html2canvas from 'html2canvas'

interface Props {
  targetRef: RefObject<HTMLDivElement>
  disabled: boolean
  remaining: number
  onReset: () => void
}

interface Poster {
  url: string
  file: File
}

export default function ShareBar({ targetRef, disabled, remaining, onReset }: Props) {
  const { t } = useTranslation()
  const [poster, setPoster] = useState<Poster | null>(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const showToast = (msg: string) => {
    setPoster(null)
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }

  const makePoster = async () => {
    const node = targetRef.current
    if (!node || busy) return
    setBusy(true)
    // The on-screen board sits inside a transform: scale() wrapper. html2canvas
    // miscalculates coordinates under a scaled ancestor (flags/text drift), so
    // capture an UNSCALED clone at the full design width instead.
    const width = node.offsetWidth // layout width ignores the visual scale
    const holder = document.createElement('div')
    holder.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;pointer-events:none;`
    const clone = node.cloneNode(true) as HTMLElement
    clone.style.width = `${width}px`
    holder.appendChild(clone)
    document.body.appendChild(holder)
    try {
      const canvas = await html2canvas(clone, {
        backgroundColor: '#2f6fe3',
        scale: 2,
        width,
        windowWidth: width,
      })
      const url = canvas.toDataURL('image/png')
      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png'),
      )
      setPoster({ url, file: new File([blob], 'bracket.png', { type: 'image/png' }) })
    } finally {
      document.body.removeChild(holder)
      setBusy(false)
    }
  }

  // On touch devices, open the native share sheet ("Save Image" → Photos), then
  // confirm. On desktop, download the file directly.
  const savePoster = async () => {
    if (!poster) return
    const nav = navigator as Navigator & {
      canShare?: (d: { files: File[] }) => boolean
      share?: (d: { files: File[]; title?: string }) => Promise<void>
    }
    const touch = window.matchMedia?.('(pointer: coarse)').matches
    if (touch && nav.canShare?.({ files: [poster.file] }) && nav.share) {
      try {
        await nav.share({ files: [poster.file], title: t('app.title') })
        showToast(t('bracket.savedToast'))
      } catch {
        // user dismissed the share sheet — leave the preview open, no toast
      }
      return
    }
    const a = document.createElement('a')
    a.href = poster.url
    a.download = 'bracket.png'
    a.click()
    showToast(t('bracket.downloadedToast'))
  }

  return (
    <>
      <div className="actionbar">
        {disabled ? (
          <p className="actionbar__hint">{t('bracket.remaining', { count: remaining })}</p>
        ) : (
          <span className="actionbar__spacer" />
        )}
        <button type="button" className="btn btn--ghost" onClick={onReset}>
          {t('bracket.reset')}
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={makePoster}
          disabled={disabled || busy}
        >
          {busy ? t('bracket.exporting') : t('bracket.export')}
        </button>
      </div>

      {poster && (
        <div className="sheet-overlay" onClick={() => setPoster(null)}>
          <div className="sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="sheet__handle" />
            <p className="sheet__hint">{t('bracket.savedHint')}</p>
            <img className="sheet__img" src={poster.url} alt={t('bracket.export')} />
            <div className="sheet__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setPoster(null)}>
                {t('common.close')}
              </button>
              <button type="button" className="btn btn--primary" onClick={savePoster}>
                {t('bracket.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <span className="toast__check" aria-hidden="true">
            ✓
          </span>
          {toast}
        </div>
      )}
    </>
  )
}
