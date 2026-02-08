import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

function EditorModal({ open, onClose, title, fields, onSubmit, submitLabel = 'Save' }) {
  const [form, setForm] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.name, f.value ?? ''])),
  )

  useEffect(() => {
    if (open) {
      setForm(Object.fromEntries(fields.map((f) => [f.name, f.value ?? ''])))
    }
  }, [open, fields])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted hover:text-white hover:bg-card"
            aria-label="close"
          >
            <X size={16} />
          </button>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(form)
          }}
        >
          {fields.map((field) => (
            <div key={field.name} className="space-y-1.5">
              <label className="text-sm text-muted">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  value={form[field.name]}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  className="w-full bg-card border border-border rounded-lg px-3 py-2 focus:border-accent focus:outline-none"
                >
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  required={field.required}
                  type={field.type || 'text'}
                  value={form[field.name]}
                  placeholder={field.placeholder}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  className="w-full bg-card border border-border rounded-lg px-3 py-2 focus:border-accent focus:outline-none"
                />
              )}
            </div>
          ))}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-muted hover:text-white hover:border-accent/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-black font-semibold"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditorModal
