import './ProgressBar.css'

export default function ProgressBar({ value, max = 100, label }) {
  const pct = max ? Math.round((value / max) * 100) : 0
  return (
    <div className="progress">
      <div className="progress__track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <span className="progress__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress__value">{pct}%</span>
    </div>
  )
}
