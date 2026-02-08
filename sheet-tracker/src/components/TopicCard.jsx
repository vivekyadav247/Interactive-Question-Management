import { useState } from 'react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import SortableBlock from './SortableBlock'
import SubTopicCard from './SubTopicCard'

function TopicCard({
  topic,
  sensors,
  onAddSubTopic,
  onEditTopic,
  onDeleteTopic,
  onEditQuestion,
  onDeleteQuestion,
  onToggleSolved,
  onReorderSub,
  onReorderQuestions,
  onDeleteSubTopic,
}) {
  const [open, setOpen] = useState(false)
  const solved = topic.subTopics.reduce(
    (acc, s) => acc + s.questions.filter((q) => q.isSolved).length,
    0,
  )
  const total = topic.subTopics.reduce((acc, s) => acc + s.questions.length, 0)

  return (
    <div className="rounded-2xl border border-border bg-card/70 p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            onClick={() => setOpen((v) => !v)}
            className="mt-1 text-muted hover:text-white transition"
            aria-label="toggle topic"
          >
            <span className={`inline-block transform transition ${open ? 'rotate-90' : ''}`}>
              ▸
            </span>
          </button>
          <div>
            <div className="text-lg font-semibold">{topic.name}</div>
            <div className="text-sm text-muted">{solved} / {total} solved</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddSubTopic(topic.id, null)}
            className="px-3 py-1.5 text-xs rounded-lg bg-card border border-border hover:border-accent/50 flex items-center gap-1"
          >
            <Plus size={14} /> Sub-topic
          </button>
          <button
            onClick={onEditTopic}
            className="p-2 rounded-lg border border-border text-muted hover:text-white hover:border-accent/50"
            aria-label="edit topic"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={onDeleteTopic}
            className="p-2 rounded-lg border border-border text-muted hover:text-rose-300 hover:border-rose-400/50"
            aria-label="delete topic"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={({ active, over }) => {
              if (!over || active.id === over.id) return
              onReorderSub(topic.id, active.id, over.id)
            }}
          >
            <SortableContext
              items={topic.subTopics.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {topic.subTopics.length === 0 ? (
                <div className="text-sm text-muted px-2 py-3 border border-dashed border-border rounded-lg">
                  No sub-topics yet. Add one.
                </div>
              ) : (
                topic.subTopics.map((sub) => (
                  <SortableBlock key={sub.id} id={sub.id} className="pl-3">
                    <SubTopicCard
                      topicId={topic.id}
                      sub={sub}
                      sensors={sensors}
                      onAddQuestion={() => onEditQuestion(topic.id, sub.id, null)}
                      onEditSub={() => onAddSubTopic(topic.id, sub)}
                      onDeleteSub={() => onDeleteSubTopic(topic.id, sub.id)}
                      onEditQuestion={(tId, sId, q) => onEditQuestion(tId, sId, q)}
                      onDeleteQuestion={(tId, sId, qId) => onDeleteQuestion(tId, sId, qId)}
                      onToggleSolved={onToggleSolved}
                      onReorderQuestions={onReorderQuestions}
                    />
                  </SortableBlock>
                ))
              )}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}

export default TopicCard
