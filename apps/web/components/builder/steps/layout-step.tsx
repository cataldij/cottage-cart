// @ts-nocheck
'use client'

import { useState } from 'react'
import { useBuilder } from '@/contexts/builder-context'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  MAKER_SECTION_DEFINITIONS,
  generateSectionId,
  getSectionDefinition,
} from '@/lib/builder-sections'
import type { StorefrontSection, StorefrontSectionType } from '@/lib/builder-sections'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  LayoutGrid,
  Image,
  Star,
  Grid3X3,
  ShoppingBag,
  User,
  MessageSquare,
  MapPin,
  Clock,
  HelpCircle,
  Instagram,
  Mail,
  Type,
  Minus,
  Square,
  ChevronDown,
  Home,
  ClipboardList,
  MessageCircle,
} from 'lucide-react'

const SECTION_ICON_MAP: Record<string, any> = {
  Image,
  Star,
  Grid3X3,
  ShoppingBag,
  User,
  MessageSquare,
  MapPin,
  Clock,
  HelpCircle,
  Instagram,
  Mail,
  Type,
  Minus,
  Square,
}

const NAV_ICON_MAP: Record<string, any> = {
  Home,
  ShoppingBag,
  ClipboardList,
  Star,
  MessageCircle,
  MapPin,
  User,
}

// ==========================================
// Sortable Section Item
// ==========================================

// ==========================================
// Per-Section Config Panel
// ==========================================

function SectionConfigPanel({
  section,
  onUpdateConfig,
}: {
  section: StorefrontSection
  onUpdateConfig: (config: Record<string, unknown>) => void
}) {
  const config = section.config

  switch (section.sectionType) {
    case 'hero':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium">Hero Height</label>
            <select
              value={(config.height as string) || 'medium'}
              onChange={e => onUpdateConfig({ ...config, height: e.target.value })}
              className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              checked={(config.showTagline as boolean) !== false}
              onChange={e => onUpdateConfig({ ...config, showTagline: e.target.checked })}
              className="rounded"
            />
            <label className="text-xs">Show tagline</label>
          </div>
        </div>
      )

    case 'featured_products':
      return (
        <div className="space-y-1">
          <label className="text-xs font-medium">Number of featured items</label>
          <select
            value={(config.count as number) || 3}
            onChange={e => onUpdateConfig({ ...config, count: parseInt(e.target.value) })}
            className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
          >
            <option value={2}>2 items</option>
            <option value={3}>3 items</option>
            <option value={4}>4 items</option>
            <option value={6}>6 items</option>
          </select>
        </div>
      )

    case 'faq': {
      const items = (config.items as Array<{ q: string; a: string }>) || []
      const updateItem = (index: number, key: 'q' | 'a', value: string) => {
        const updated = [...items]
        updated[index] = { ...updated[index], [key]: value }
        onUpdateConfig({ ...config, items: updated })
      }
      const addItem = () => {
        onUpdateConfig({ ...config, items: [...items, { q: '', a: '' }] })
      }
      const removeItem = (index: number) => {
        onUpdateConfig({ ...config, items: items.filter((_, i) => i !== index) })
      }
      return (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="space-y-1.5 rounded-lg border bg-slate-50 p-2.5">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-1.5">
                  <input
                    value={item.q}
                    onChange={e => updateItem(i, 'q', e.target.value)}
                    placeholder="Question"
                    className="w-full rounded border bg-white px-2 py-1 text-xs"
                  />
                  <input
                    value={item.a}
                    onChange={e => updateItem(i, 'a', e.target.value)}
                    placeholder="Answer"
                    className="w-full rounded border bg-white px-2 py-1 text-xs"
                  />
                </div>
                <button onClick={() => removeItem(i)} className="mt-1 text-slate-400 hover:text-red-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <Plus className="h-3 w-3" /> Add question
          </button>
        </div>
      )
    }

    case 'newsletter_signup':
      return (
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-xs font-medium">Headline</label>
            <input
              value={(config.headline as string) || ''}
              onChange={e => onUpdateConfig({ ...config, headline: e.target.value })}
              className="w-full rounded border bg-white px-2 py-1.5 text-sm"
              placeholder="Stay in the loop"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Description</label>
            <input
              value={(config.description as string) || ''}
              onChange={e => onUpdateConfig({ ...config, description: e.target.value })}
              className="w-full rounded border bg-white px-2 py-1.5 text-sm"
              placeholder="Get notified about new drops"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Button Text</label>
            <input
              value={(config.buttonText as string) || ''}
              onChange={e => onUpdateConfig({ ...config, buttonText: e.target.value })}
              className="w-full rounded border bg-white px-2 py-1.5 text-sm"
              placeholder="Subscribe"
            />
          </div>
        </div>
      )

    case 'custom_text':
      return (
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-xs font-medium">Heading</label>
            <input
              value={(config.heading as string) || ''}
              onChange={e => onUpdateConfig({ ...config, heading: e.target.value })}
              className="w-full rounded border bg-white px-2 py-1.5 text-sm"
              placeholder="Section heading"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Text Content</label>
            <textarea
              value={(config.text as string) || ''}
              onChange={e => onUpdateConfig({ ...config, text: e.target.value })}
              className="w-full rounded border bg-white px-2 py-1.5 text-sm"
              rows={3}
              placeholder="Your content here..."
            />
          </div>
        </div>
      )

    case 'spacer':
      return (
        <div className="space-y-1">
          <label className="text-xs font-medium">Spacer Height</label>
          <select
            value={(config.height as string) || 'md'}
            onChange={e => onUpdateConfig({ ...config, height: e.target.value })}
            className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">Extra Large</option>
          </select>
        </div>
      )

    default:
      return null
  }
}

// ==========================================
// Sortable Section Item (with expandable config)
// ==========================================

function SortableSectionItem({
  section,
  onToggleVisibility,
  onRemove,
  onUpdateConfig,
}: {
  section: StorefrontSection
  onToggleVisibility: () => void
  onRemove: () => void
  onUpdateConfig: (config: Record<string, unknown>) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const def = getSectionDefinition(section.sectionType)
  const Icon = SECTION_ICON_MAP[def?.icon || 'Square'] || Square
  const hasConfig = ['hero', 'featured_products', 'faq', 'newsletter_signup', 'custom_text', 'spacer'].includes(section.sectionType)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border transition-all ${
        isDragging
          ? 'z-50 border-emerald-400 bg-emerald-50 shadow-lg'
          : section.isVisible
          ? 'border-slate-200 bg-white hover:shadow-sm'
          : 'border-dashed border-slate-200 bg-slate-50 opacity-60'
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          section.isVisible ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-400'
        }`}>
          <Icon className="h-4 w-4" />
        </div>

        <button
          className="flex-1 min-w-0 text-left"
          onClick={() => hasConfig && setExpanded(!expanded)}
        >
          <p className="text-sm font-semibold truncate">{def?.name || section.sectionType}</p>
          <p className="text-[11px] text-muted-foreground truncate">{def?.description || ''}</p>
        </button>

        {hasConfig && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            title="Configure section"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        )}

        <button
          onClick={onToggleVisibility}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          title={section.isVisible ? 'Hide section' : 'Show section'}
        >
          {section.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>

        {!def?.singleton && (
          <button
            onClick={onRemove}
            className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
            title="Remove section"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {expanded && hasConfig && (
        <div className="border-t bg-slate-50/50 px-3 pb-3 pt-2">
          <SectionConfigPanel section={section} onUpdateConfig={onUpdateConfig} />
        </div>
      )}
    </div>
  )
}

// ==========================================
// Add Section Dropdown
// ==========================================

function AddSectionDropdown({
  currentSections,
  onAdd,
}: {
  currentSections: StorefrontSection[]
  onAdd: (type: StorefrontSectionType) => void
}) {
  const [open, setOpen] = useState(false)

  const categories = [
    { key: 'content', label: 'Content' },
    { key: 'engagement', label: 'Engagement' },
    { key: 'layout', label: 'Layout' },
    { key: 'custom', label: 'Custom' },
  ]

  const isDisabled = (type: StorefrontSectionType) => {
    const def = getSectionDefinition(type)
    if (def?.singleton && currentSections.some(s => s.sectionType === type)) {
      return true
    }
    return false
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-2 border-dashed"
      >
        <Plus className="h-4 w-4" />
        Add Section
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border bg-white p-2 shadow-xl">
            {categories.map(cat => {
              const defs = MAKER_SECTION_DEFINITIONS.filter(d => d.category === cat.key)
              if (defs.length === 0) return null
              return (
                <div key={cat.key} className="mb-2">
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {cat.label}
                  </p>
                  {defs.map(def => {
                    const disabled = isDisabled(def.type)
                    const Icon = SECTION_ICON_MAP[def.icon] || Square
                    return (
                      <button
                        key={def.type}
                        disabled={disabled}
                        onClick={() => {
                          onAdd(def.type)
                          setOpen(false)
                        }}
                        className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors ${
                          disabled
                            ? 'cursor-not-allowed opacity-40'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-sm font-medium">{def.name}</p>
                          <p className="text-[11px] text-slate-400">{def.description}</p>
                        </div>
                        {disabled && (
                          <span className="ml-auto text-[10px] text-slate-400">Already added</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ==========================================
// Navigation Tab (existing module toggles)
// ==========================================

function NavigationTab() {
  const { state, toggleModule } = useBuilder()
  const { navigation } = state

  const enabledModules = navigation.filter(m => m.enabled)
  const disabledModules = navigation.filter(m => !m.enabled)

  const getDesc = (id: string) => {
    const d: Record<string, string> = {
      home: 'Featured products, maker story, and quick actions',
      catalog: 'Browse categories and shop all products',
      orders: 'Track upcoming, active, and past orders',
      pickup: 'Pickup windows, location, and instructions',
      reviews: 'Ratings, testimonials, and social proof',
      messages: 'Buyer messages and support requests',
      account: 'Customer profile, preferences, and saved details',
    }
    return d[id] || ''
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choose which tabs customers see in your mobile app.
      </p>

      <div className="space-y-2">
        {[...enabledModules, ...disabledModules]
          .sort((a, b) => {
            if (a.enabled && !b.enabled) return -1
            if (!a.enabled && b.enabled) return 1
            return a.order - b.order
          })
          .map((mod) => {
            const Icon = NAV_ICON_MAP[mod.icon] || Home
            return (
              <div
                key={mod.id}
                className={`flex items-center gap-3 rounded-xl border p-3 ${
                  mod.enabled ? 'border-slate-200 bg-white' : 'border-dashed border-slate-200 bg-slate-50 opacity-60'
                }`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  mod.enabled ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-400'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{mod.name}</p>
                  <p className="text-[11px] text-muted-foreground">{getDesc(mod.id)}</p>
                </div>
                <Switch
                  checked={mod.enabled}
                  onCheckedChange={() => toggleModule(mod.id)}
                />
              </div>
            )
          })}
      </div>
    </div>
  )
}

// ==========================================
// Main Layout Step
// ==========================================

export function LayoutStep() {
  const { state, updateSections } = useBuilder()
  const { sections } = state
  const [activeTab, setActiveTab] = useState<'sections' | 'tabs'>('sections')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sections.findIndex(s => s.id === active.id)
    const newIndex = sections.findIndex(s => s.id === over.id)
    updateSections(arrayMove(sections, oldIndex, newIndex))
  }

  const handleToggleVisibility = (id: string) => {
    updateSections(
      sections.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s)
    )
  }

  const handleRemove = (id: string) => {
    updateSections(sections.filter(s => s.id !== id))
  }

  const handleUpdateConfig = (id: string, config: Record<string, unknown>) => {
    updateSections(
      sections.map(s => s.id === id ? { ...s, config } : s)
    )
  }

  const handleAdd = (type: StorefrontSectionType) => {
    const def = getSectionDefinition(type)
    if (!def) return
    const newSection: StorefrontSection = {
      id: generateSectionId(),
      sectionType: type,
      config: { ...def.defaultConfig },
      isVisible: true,
    }
    updateSections([...sections, newSection])
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <LayoutGrid className="h-5 w-5 text-primary" />
          Layout
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag sections to reorder, toggle visibility, or add new ones.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
        <button
          onClick={() => setActiveTab('sections')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            activeTab === 'sections'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Page Sections
        </button>
        <button
          onClick={() => setActiveTab('tabs')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            activeTab === 'tabs'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          App Tabs
        </button>
      </div>

      {activeTab === 'sections' ? (
        <div className="space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section) => (
                <SortableSectionItem
                  key={section.id}
                  section={section}
                  onToggleVisibility={() => handleToggleVisibility(section.id)}
                  onRemove={() => handleRemove(section.id)}
                  onUpdateConfig={(config) => handleUpdateConfig(section.id, config)}
                />
              ))}
            </SortableContext>
          </DndContext>

          <AddSectionDropdown currentSections={sections} onAdd={handleAdd} />

          <div className="rounded-xl border bg-emerald-50 p-3">
            <p className="text-sm text-emerald-800">
              <strong>Tip:</strong> Put your most important sections first. Customers see them in this exact order.
            </p>
          </div>
        </div>
      ) : (
        <NavigationTab />
      )}
    </div>
  )
}
