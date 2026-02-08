import { CheckCircle2, Circle, Edit2, Link as LinkIcon, Trash2 } from 'lucide-react'
import { badgeColors, hostLabel } from '../utils/ui'

function QuestionRow({ question, onToggle, onEdit, onDelete }) {
  const solved = question.isSolved
  return (
    <div className="grid grid-cols-6 md:grid-cols-12 items-center gap-3 px-3 py-2 rounded-lg border border-border bg-card/60">
      <div className="col-span-1 flex items-center gap-2">
        <button
          onClick={onToggle}
          className="text-muted hover:text-accent transition"
          aria-label="toggle solved"
        >
          {solved ? <CheckCircle2 className="text-emerald-400" size={18} /> : <Circle size={18} />}
        </button>
      </div>
      <div className="col-span-5 md:col-span-5">
        <div className="text-sm font-semibold text-white">{question.title}</div>
        {question.resource && (
          <a
            className="inline-flex items-center gap-1 text-xs text-amber-200 hover:text-amber-100"
            href={question.resource}
            target="_blank"
            rel="noreferrer"
          >
            <LinkIcon size={14} /> {hostLabel(question.resource)}
          </a>
        )}
      </div>
      <div className="col-span-2 md:col-span-2">
        <span className={`text-xs px-2 py-1 rounded-full ${badgeColors[question.difficulty] || 'bg-border text-muted border border-border'}`}>
          {question.difficulty}
        </span>
      </div>
      <div className="col-span-3 md:col-span-2 text-xs text-muted truncate">
        {question.problemUrl ? (
          <a
            className="text-amber-200 hover:text-amber-100"
            href={question.problemUrl}
            target="_blank"
            rel="noreferrer"
          >
            {hostLabel(question.problemUrl)}
          </a>
        ) : (
          '—'
        )}
      </div>
      <div className="col-span-6 md:col-span-2 flex justify-end gap-2">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg border border-border text-muted hover:text-white hover:border-accent/50"
          aria-label="edit question"
        >
          <Edit2 size={15} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg border border-border text-muted hover:text-rose-300 hover:border-rose-400/50"
          aria-label="delete question"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

export default QuestionRow
