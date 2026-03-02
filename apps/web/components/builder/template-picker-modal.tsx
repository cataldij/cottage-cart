// @ts-nocheck
'use client'

import { useState } from 'react'
import { useBuilder } from '@/contexts/builder-context'
import { BUILDER_TEMPLATES } from '@/lib/builder-templates'
import { DEFAULT_SECTIONS } from '@/lib/builder-sections'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, X } from 'lucide-react'

interface TemplatePickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplatePickerModal({ open, onOpenChange }: TemplatePickerModalProps) {
  const { applyTemplate } = useBuilder()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [applied, setApplied] = useState(false)

  const handleApply = () => {
    if (!selectedId) return
    const template = BUILDER_TEMPLATES.find(t => t.id === selectedId)
    if (template) {
      applyTemplate(template)
      setApplied(true)
      setTimeout(() => {
        setApplied(false)
        setSelectedId(null)
        onOpenChange(false)
      }, 800)
    }
  }

  const handleClose = () => {
    setSelectedId(null)
    setApplied(false)
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 animate-in fade-in-0"
        onClick={handleClose}
      />

      {/* Modal content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-3xl rounded-2xl border bg-white p-6 shadow-xl animate-in fade-in-0 zoom-in-95"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="mb-1">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Choose a Template
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Pick a starting point for your shop. You can customize everything after.
            </p>
          </div>

          {/* Template grid */}
          <div className="mt-4 grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
            {BUILDER_TEMPLATES.map((template) => {
              const isSelected = selectedId === template.id
              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedId(template.id)}
                  className={`relative flex flex-col rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}

                  {/* Color swatch strip */}
                  <div className="mb-3 flex gap-1">
                    <div className="h-6 w-6 rounded-full" style={{ backgroundColor: template.colors.primary }} />
                    <div className="h-6 w-6 rounded-full" style={{ backgroundColor: template.colors.secondary }} />
                    <div className="h-6 w-6 rounded-full" style={{ backgroundColor: template.colors.accent }} />
                    <div className="h-6 w-6 rounded-full" style={{ backgroundColor: template.colors.background, border: '1px solid #e2e8f0' }} />
                  </div>

                  {/* Template info */}
                  <div className="text-2xl">{template.emoji}</div>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{template.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{template.vibe}</p>

                  {/* Font preview */}
                  <div className="mt-2 rounded bg-slate-50 px-2 py-1">
                    <p className="text-[10px] text-slate-400">
                      {template.fonts.heading} + {template.fonts.body}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Footer buttons */}
          <div className="mt-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Start from scratch
            </Button>
            <Button
              onClick={handleApply}
              disabled={!selectedId || applied}
              className="gap-2"
            >
              {applied ? (
                <>
                  <Check className="h-4 w-4" /> Applied!
                </>
              ) : (
                'Apply Template'
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
