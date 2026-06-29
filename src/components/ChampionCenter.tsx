import { useTranslation } from 'react-i18next'
import type { Team } from '../types'
import { resolveLang, teamLabel } from '../i18n/lang'

interface Props {
  champion: Team | null
  label: string
}

const TROPHY = `${import.meta.env.BASE_URL}trophy.png`

export default function ChampionCenter({ champion, label }: Props) {
  const { t, i18n } = useTranslation()
  const lang = resolveLang(i18n.language)
  return (
    <div className={`champion${champion ? ' champion--won' : ''}`}>
      <img className="champion__trophy" src={TROPHY} alt="" aria-hidden="true" />
      <p className="champion__label">{label}</p>
      <span className="champion__teamwrap">
        <p
          className={`champion__team${champion ? '' : ' champion__team--empty'}`}
          data-testid="champion-name"
        >
          {champion ? `${champion.flag} ${teamLabel(champion, lang)}` : t('bracket.championEmpty')}
        </p>
      </span>
    </div>
  )
}
