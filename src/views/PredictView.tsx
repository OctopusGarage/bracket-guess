import { useRef } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Tournament } from '../types'
import { getTournament } from '../data'
import { resolveLang, tr } from '../i18n/lang'
import { useBracket } from '../hooks/useBracket'
import BracketBoard from '../components/BracketBoard'
import ShareBar from '../components/ShareBar'
import LangToggle from '../components/LangToggle'

// Outer shell: no hooks, safe early return when tournamentId is invalid.
export default function PredictView() {
  const { tournamentId } = useParams()
  const tournament = tournamentId ? getTournament(tournamentId) : undefined
  if (!tournament) return <Navigate to="/" replace />
  return <PredictBoard tournament={tournament} />
}

// Inner component: hooks always called unconditionally (only renders for valid tournament).
function PredictBoard({ tournament }: { tournament: Tournament }) {
  const { t, i18n } = useTranslation()
  const lang = resolveLang(i18n.language)
  const boardRef = useRef<HTMLDivElement>(null)
  const bracket = useBracket(tournament)

  return (
    <div className="predict">
      <div className="page-bg" aria-hidden="true" />

      <header className="topbar">
        <Link to="/" className="iconbtn" aria-label={t('common.back')}>
          ←
        </Link>
        <span className="topbar__title">{tr(tournament.title, lang)}</span>
        <LangToggle />
      </header>

      <main className="predict__main">
        <BracketBoard
          ref={boardRef}
          tournament={tournament}
          bracket={bracket}
          qrUrl={tournament.qrUrl}
        />
      </main>

      <ShareBar
        targetRef={boardRef}
        disabled={!bracket.isComplete}
        remaining={bracket.remaining}
        onReset={bracket.reset}
      />
    </div>
  )
}
