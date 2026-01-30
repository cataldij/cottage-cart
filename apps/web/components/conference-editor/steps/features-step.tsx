'use client'

import { useConferenceEditor } from '@/contexts/conference-editor-context'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  LayoutGrid,
  Home,
  Calendar,
  Users,
  Building2,
  MessageCircle,
  Map,
  Bell,
  User,
  GripVertical,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'

const ICONS: Record<string, typeof Home> = {
  Home,
  Calendar,
  Users,
  Building2,
  MessageCircle,
  Map,
  Bell,
  User,
}

interface SortableModuleProps {
  id: string
  name: string
  icon: string
  enabled: boolean
  onToggle: () => void
}

function SortableModule({ id, name, icon, enabled, onToggle }: SortableModuleProps) {
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

  const IconComponent = ICONS[icon] || Home

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-4 rounded-xl border bg-white p-4 transition-all',
        isDragging
          ? 'border-blue-500 shadow-lg shadow-blue-500/20'
          : 'border-slate-200 hover:border-slate-300',
        !enabled && 'opacity-50'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-slate-400 hover:text-slate-600 active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          enabled ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
        )}
      >
        <IconComponent className="h-5 w-5" />
      </div>

      <div className="flex-1">
        <span className={cn(
          'font-medium',
          enabled ? 'text-slate-900' : 'text-slate-500'
        )}>
          {name}
        </span>
      </div>

      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
      />
    </div>
  )
}

export function FeaturesStep() {
  const { state, toggleModule, reorderModules } = useConferenceEditor()
  const { modules } = state

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = modules.findIndex((m) => m.id === active.id)
      const newIndex = modules.findIndex((m) => m.id === over.id)
      reorderModules(arrayMove(modules, oldIndex, newIndex))
    }
  }

  const enabledCount = modules.filter(m => m.enabled).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <LayoutGrid className="h-5 w-5 text-emerald-600" />
          App Features
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose which modules to include in your conference app. Drag to reorder.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
        <span className="text-sm text-slate-600">
          <strong>{enabledCount}</strong> of {modules.length} modules enabled
        </span>
        <button
          onClick={() => modules.forEach(m => !m.enabled && toggleModule(m.id))}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Enable All
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={modules.map(m => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {modules.map((module) => (
              <SortableModule
                key={module.id}
                id={module.id}
                name={module.name}
                icon={module.icon}
                enabled={module.enabled}
                onToggle={() => toggleModule(module.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          <strong>Tip:</strong> The order here determines the tab order in your mobile app.
          Put the most important features at the top.
        </p>
      </div>
    </div>
  )
}
