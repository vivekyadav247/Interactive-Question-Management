import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

function SortableBlock({ id, children, className = '' }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative ${isDragging ? 'opacity-75' : ''} ${className}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 text-muted hover:text-white cursor-grab opacity-60 group-hover:opacity-100 transition-colors"
        aria-label="Drag handle"
      >
        <GripVertical size={16} />
      </button>
      <div className="pl-7">{children}</div>
    </div>
  )
}

export default SortableBlock
