interface Props {
  className?: string
  /** Decorative (watermark) trophies pass aria-hidden. */
  decorative?: boolean
}

/** Stylised FIFA World Cup trophy (大力神杯): a globe held aloft over a
 *  spiralling body on a round base — not a generic cup. */
export default function Trophy({ className, decorative }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 64"
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : '大力神杯'}
    >
      <defs>
        <linearGradient id="wc-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffeaad" />
          <stop offset="0.5" stopColor="#f4c34c" />
          <stop offset="1" stopColor="#c5881f" />
        </linearGradient>
      </defs>
      <g fill="url(#wc-gold)">
        <circle cx="24" cy="11.5" r="8.4" />
        <path d="M16.6 18.4c-2.6 3.4-6.8 6.6-4 16.4 1.9 6.5 6.9 9 11.4 9s9.5-2.5 11.4-9c2.8-9.8-1.4-13-4-16.4-2.3 2.6-5 3.4-7.4 3.4s-5.1-.8-7.4-3.4Z" />
        <rect x="15.4" y="43" width="17.2" height="3.4" rx="1.5" />
        <path d="M13.5 46.8h21l-2.3 5.2H15.8Z" />
        <ellipse cx="24" cy="53.6" rx="12.4" ry="3.2" />
        <rect x="13.5" y="55.8" width="21" height="3.4" rx="1.7" />
      </g>
    </svg>
  )
}
