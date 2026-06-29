import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface Props {
  url: string
  size?: number
}

export default function QrCode({ url, size = 96 }: Props) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    QRCode.toDataURL(url, { width: size, margin: 1 }).then(setSrc).catch(() => {})
  }, [url, size])
  if (!src) return null
  return <img className="qr-code" src={src} alt="qr" width={size} height={size} />
}
