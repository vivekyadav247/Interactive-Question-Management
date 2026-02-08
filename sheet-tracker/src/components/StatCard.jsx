function StatCard({ label, value, sub, tone = 'default' }) {
  const toneClass =
    tone === 'success'
      ? 'text-emerald-300'
      : tone === 'warning'
        ? 'text-amber-300'
        : tone === 'danger'
          ? 'text-rose-300'
          : 'text-white'
  return (
    <div className="glass gradient-border rounded-xl px-4 py-3 flex flex-col gap-1 min-w-[160px]">
      <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
      <div className={`text-lg font-semibold ${toneClass}`}>{value}</div>
      {sub && <div className="text-sm text-muted">{sub}</div>}
    </div>
  )
}

export default StatCard
