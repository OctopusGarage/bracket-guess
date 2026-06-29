import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { tournaments } from '../data'
import { roundsCount } from '../lib/bracketMath'
import { resolveLang, tr } from '../i18n/lang'
import LangToggle from '../components/LangToggle'
import Trophy from '../components/Trophy'

export default function HomeView() {
  const { t, i18n } = useTranslation()
  const lang = resolveLang(i18n.language)

  return (
    <div className="home">
      <div className="page-bg" aria-hidden="true" />

      <header className="topbar">
        <span className="topbar__title" />
        <LangToggle />
      </header>

      <main className="home__wrap">
        <div className="home__head">
          <div className="home__titles">
            <p className="home__en">{t('app.subtitle')}</p>
            <h1 className="home__title">{t('app.title')}</h1>
          </div>
          <span className="home__avatar" aria-hidden="true">
            ⚽
          </span>
        </div>
        <p className="home__lede">{t('home.lede')}</p>

        <p className="eyebrow">{t('home.pick')}</p>
        <ul className="ticket-list">
          {tournaments.map((tn) => (
            <li key={tn.id}>
              <Link className="ticket" to={`/predict/${tn.id}`}>
                <span className="ticket__badge">
                  <Trophy />
                </span>
                <span className="ticket__name">{tr(tn.title, lang)}</span>
                <span className="ticket__meta">
                  {t('home.meta', { teams: tn.size, rounds: roundsCount(tn.size) })}
                </span>
                <span className="ticket__go btn btn--primary">{t('home.start')}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <footer className="home__foot">{t('home.foot')}</footer>
    </div>
  )
}
