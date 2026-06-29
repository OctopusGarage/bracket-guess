import { forwardRef, Fragment, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Tournament } from '../types'
import { getBandLayout, matchKey } from '../lib/bracketMath'
import { useBracket } from '../hooks/useBracket'
import { resolveLang, tr } from '../i18n/lang'
import MatchSlot from './MatchSlot'
import ChampionCenter from './ChampionCenter'
import QrCode from './QrCode'
import Trophy from './Trophy'

interface Props {
  tournament: Tournament
  bracket?: ReturnType<typeof useBracket>
  qrUrl?: string
}

/** The poster is designed at this width (roomy cells), then scaled to fit. */
const DESIGN_WIDTH = 740

/** Rounds this wide render a touch smaller, but the name always shows. */
const COMPACT_FROM = 8

/**
 * Connector lines between two adjacent rounds. The round farther from the
 * centre is the "child" (more matches); when a child match has a pick, that
 * segment turns yellow — tracing your path toward the trophy.
 */
function Connectors({
  childCount,
  parentCount,
  childOnTop,
  active,
}: {
  childCount: number
  parentCount: number
  childOnTop: boolean
  active: boolean[]
}) {
  return (
    <svg className="connectors" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {Array.from({ length: childCount }, (_, i) => {
        const childX = ((i + 0.5) / childCount) * 100
        const parentIdx = parentCount === childCount ? i : Math.floor(i / 2)
        const parentX = ((parentIdx + 0.5) / parentCount) * 100
        return (
          <line
            key={i}
            x1={childOnTop ? childX : parentX}
            y1={0}
            x2={childOnTop ? parentX : childX}
            y2={100}
            className={active[i] ? 'cx cx--on' : 'cx'}
          />
        )
      })}
    </svg>
  )
}

const BracketBoard = forwardRef<HTMLDivElement, Props>(function BracketBoard(
  { tournament, bracket: bracketProp, qrUrl },
  ref,
) {
  const { t, i18n } = useTranslation()
  const lang = resolveLang(i18n.language)
  const ownBracket = useBracket(tournament)
  const bracket = bracketProp ?? ownBracket
  const bands = getBandLayout(tournament.size)
  const centerIndex = bands.findIndex((b) => b.side === 'center')

  // Render the board at DESIGN_WIDTH, then scale it down to fit the frame so
  // it fills one screen on a phone while the exported PNG stays full-res.
  const frameRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)
  const [frameH, setFrameH] = useState<number | undefined>(undefined)

  // Forward the board node to the parent (used for PNG export) and keep a local ref.
  const setBoardRef = (node: HTMLDivElement | null) => {
    boardRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) (ref as unknown as { current: HTMLDivElement | null }).current = node
  }

  useLayoutEffect(() => {
    const fit = () => {
      const fw = frameRef.current?.clientWidth || DESIGN_WIDTH
      const s = Math.min(1, fw / DESIGN_WIDTH)
      const h = boardRef.current?.offsetHeight || 0
      setScale((prev) => (Math.abs(prev - s) > 0.001 ? s : prev))
      setFrameH((prev) => {
        const next = h ? h * s : undefined
        return prev !== next ? next : prev
      })
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  })

  return (
    <div className="poster-frame" ref={frameRef} style={{ height: frameH }}>
      <div className="poster-scale" style={{ transform: `scale(${scale})` }}>
        <div className="board" ref={setBoardRef}>
          <Trophy className="board__watermark" decorative />

          {/* flank the narrow centre of the bracket (where the sides are empty) */}
          {qrUrl && (
            <div className="board__aside board__aside--left">
              <QrCode url={qrUrl} size={88} />
              <span className="board__aside-cap">{t('bracket.scanHint')}</span>
            </div>
          )}
          <div className="board__aside board__aside--right">
            <span className="board__aside-brand">{t('app.title')}</span>
            <span className="board__aside-tag">{t('bracket.sideSlogan')}</span>
          </div>

          <div className="board__header">
            <p className="eyebrow">{t('bracket.tagline')}</p>
            <h1 className="board__title">{tr(tournament.title, lang)}</h1>
          </div>

          <div className="board__bracket">
            {bands.map((band, i) => {
              const testid =
                band.side === 'center' ? 'band-center' : `band-${band.side}-${band.roundIndex}`
              const cols = band.matchIndices.length
              const compact = cols >= COMPACT_FROM

              const matchesEl = (
                <div
                  className="band__matches"
                  style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                >
                  {band.matchIndices.map((m) => (
                    <MatchSlot
                      key={matchKey(band.roundIndex, m)}
                      teams={bracket.matchTeams(band.roundIndex, m)}
                      winnerId={bracket.picks[matchKey(band.roundIndex, m)]}
                      onPick={(id) => bracket.pick(band.roundIndex, m, id)}
                      compact={compact}
                    />
                  ))}
                </div>
              )

              const roundTag = (
                <p className="round-tag">{tr(tournament.rounds[band.roundIndex], lang)}</p>
              )
              const content =
                band.side === 'center' ? (
                  // the final fixture and its result sit in one row
                  <div className="band__final-row">
                    {matchesEl}
                    <ChampionCenter champion={bracket.champion} label={t('bracket.champion')} />
                  </div>
                ) : (
                  matchesEl
                )

              const bandEl = (
                <div className={`band band--${band.side}`} data-testid={testid}>
                  {/* mirror the layout: lower half puts the round label below its
                      cards so the bracket is symmetric top-to-bottom */}
                  {band.side === 'lower' ? (
                    <>
                      {content}
                      {roundTag}
                    </>
                  ) : (
                    <>
                      {roundTag}
                      {content}
                    </>
                  )}
                </div>
              )

              let connector = null
              if (i < bands.length - 1) {
                const next = bands[i + 1]
                const childOnTop = i < centerIndex
                const childBand = childOnTop ? band : next
                const parentBand = childOnTop ? next : band
                connector = (
                  <Connectors
                    childCount={childBand.matchIndices.length}
                    parentCount={parentBand.matchIndices.length}
                    childOnTop={childOnTop}
                    active={childBand.matchIndices.map(
                      (m) => !!bracket.picks[matchKey(childBand.roundIndex, m)],
                    )}
                  />
                )
              }

              return (
                <Fragment key={testid}>
                  {bandEl}
                  {connector}
                </Fragment>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
})

export default BracketBoard
