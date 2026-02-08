import { useState } from 'react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { BookOpen, Edit2, Plus, Trash2 } from 'lucide-react'
import SortableBlock from './SortableBlock'
import QuestionRow from './QuestionRow'

function SubTopicCard({
  topicId,
  sub,
  sensors,
  onAddQuestion,
  onEditSub,
  onDeleteSub,
  onEditQuestion,
  onDeleteQuestion,
  onToggleSolved,
  onReorderQuestions,
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-border bg-surface/80 p-3 space-y-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-muted hover:text-white transition"
            aria-label="toggle sub-topic"
          >
            <span className={`inline-block transform transition ${open ? 'rotate-90' : ''}`}>
              ▸
            </span>
          </button>
          <BookOpen size={16} className="text-amber-300" />
          <div>
            <div className="font-semibold">{sub.name}</div>
            <div className="text-xs text-muted">
              {sub.questions.filter((q) => q.isSolved).length} / {sub.questions.length} solved
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddQuestion}
            className="px-3 py-1.5 text-xs rounded-lg bg-card border border-border hover:border-accent/50 flex items-center gap-1"
          >
            <Plus size={14} /> Question
          </button>
          <button
            onClick={onEditSub}
            className="p-2 rounded-lg border border-border text-muted hover:text-white hover:border-accent/50"
            aria-label="edit sub-topic"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={onDeleteSub}
            className="p-2 rounded-lg border border-border text-muted hover:text-rose-300 hover:border-rose-400/50"
            aria-label="delete sub-topic"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {open && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={({ active, over }) => {
            if (!over || active.id === over.id) return
            onReorderQuestions(topicId, sub.id, active.id, over.id)
          }}
        >
          <SortableContext
            items={sub.questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sub.questions.length === 0 ? (
                <div className="text-sm text-muted px-2 py-3 border border-dashed border-border rounded-lg">
                  No questions yet. Add one.
                </div>
              ) : (
                sub.questions.map((q) => (
                  <SortableBlock key={q.id} id={q.id}>
                    <QuestionRow
                      question={q}
                      onToggle={() => onToggleSolved(topicId, sub.id, q.id)}
                      onEdit={() => onEditQuestion(topicId, sub.id, q)}
                      onDelete={() => onDeleteQuestion(topicId, sub.id, q.id)}
                    />
                  </SortableBlock>
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

export default SubTopicCard
