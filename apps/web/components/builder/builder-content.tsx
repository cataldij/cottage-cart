'use client'

import { useState, useEffect } from 'react'
import { useBuilder } from '@/contexts/builder-context'
import { OverviewStep } from './steps/overview-step'
import { BrandingStep } from './steps/branding-step'
import { LayoutStep } from './steps/layout-step'
import { PublishStep } from './steps/publish-step'
import { TemplatePickerModal } from './template-picker-modal'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, AlertTriangle, LogIn, Sparkles } from 'lucide-react'

export function BuilderContent() {
  const {
    currentStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    generateEventCode,
    previewEnabled,
    setPreviewEnabled,
    saveDraft,
    isSaving,
    lastSavedAt,
    saveError,
    isAuthenticated,
    state,
  } = useBuilder()

  const [templateModalOpen, setTemplateModalOpen] = useState(false)

  // Auto-show template picker for new shops (no saved state)
  useEffect(() => {
    if (isAuthenticated !== null && !state.overview.id && !lastSavedAt) {
      setTemplateModalOpen(true)
    }
  }, [isAuthenticated, state.overview.id, lastSavedAt])

  return (
    <div className="flex h-full flex-col">
      {/* Auth warning */}
      {isAuthenticated === false && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <LogIn className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Not logged in</p>
            <p className="text-xs text-amber-700">
              Sign in to save your shop setup and preview your storefront.
            </p>
          </div>
          <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100" asChild>
            <a href="/login">Sign In</a>
          </Button>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between rounded-2xl border bg-white/80 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Preview changes</p>
          <p className="text-xs text-slate-500">
            Toggle live preview without saving.
          </p>
          {lastSavedAt && (
            <p className="mt-1 text-[11px] text-slate-400">
              Last saved {new Date(lastSavedAt).toLocaleTimeString()}
            </p>
          )}
          {saveError && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-red-600">
              <AlertTriangle className="h-3 w-3" />
              {saveError}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTemplateModalOpen(true)}
            className="gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Templates
          </Button>
          <Button
            variant={previewEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewEnabled(!previewEnabled)}
          >
            {previewEnabled ? 'Preview On' : 'Preview Off'}
          </Button>
          <Button size="sm" onClick={saveDraft} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
      {/* Template Picker Modal */}
      <TemplatePickerModal open={templateModalOpen} onOpenChange={setTemplateModalOpen} />

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto rounded-2xl border bg-white/80 p-6 backdrop-blur-xl">
        {currentStep === 0 && <OverviewStep />}
        {currentStep === 1 && <BrandingStep />}
        {currentStep === 2 && <LayoutStep />}
        {currentStep === 3 && <PublishStep />}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-4 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={!canGoPrev}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        {canGoNext ? (
          <Button onClick={nextStep} className="gap-2">
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={generateEventCode} className="gap-2 bg-green-600 hover:bg-green-700">
            Publish Storefront
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
