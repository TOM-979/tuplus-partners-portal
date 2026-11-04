// Logo oficial TUPLUS. "light" para fondos oscuros, "dark" para fondos claros.
export default function Logo({ tone = 'dark', height = 32 }) {
  const src = tone === 'light' ? '/logo-tuplus-claro.png' : '/logo-tuplus.png'
  return <img src={src} alt="TUPLUS" style={{ height, width: 'auto' }} />
}
