'use client'

import { useBuilder } from '@/contexts/builder-context'
import { OverviewStep } from './steps/overview-step'
import { BrandingStep } from './steps/branding-step'
import { NavigationStep } from './steps/navigation-step'
import { PublishStep } from './steps/publish-step'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

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
  } = useBuilder()

  return (
    <div className="flex h-full flex-col">
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
        </div>
        <div className="flex items-center gap-2">
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
      {/* Step Content */}
      <div className="flex-1 overflow-y-auto rounded-2xl border bg-white/80 p-6 backdrop-blur-xl">
        {currentStep === 0 && <OverviewStep />}
        {currentStep === 1 && <BrandingStep />}
        {currentStep === 2 && <NavigationStep />}
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
            Publish App
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
