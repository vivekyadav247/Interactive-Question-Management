import { Plus, Search } from 'lucide-react'

function Toolbar({ filters, onSearch, onDifficultyChange, onAddTopic }) {
  const options = ['all', 'easy', 'medium', 'hard']
  return (
    <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
      <div className="w-full lg:w-2/3 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={filters.query}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search questions, topics, resources"
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 transition"
          />
        </div>
        <div className="flex items-center gap-2">
          {options.map((opt) => {
            const active = filters.difficulty === opt
            return (
              <button
                key={opt}
                onClick={() => onDifficultyChange(opt)}
                className={`px-3 py-2 text-xs uppercase tracking-wide rounded-lg border transition ${
                  active
                    ? 'border-accent/60 bg-accent/15 text-amber-200'
                    : 'border-border bg-surface text-muted hover:border-accent/30'
                }`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>
      <button
        onClick={onAddTopic}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-black font-semibold shadow-soft hover:brightness-105 transition"
      >
        <Plus size={18} /> Add Topic
      </button>
    </div>
  )
}

export default Toolbar
