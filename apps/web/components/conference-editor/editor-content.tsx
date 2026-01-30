'use client'

import { useConferenceEditor } from '@/contexts/conference-editor-context'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Save } from 'lucide-react'
import { OverviewStep } from './steps/overview-step'
import { BrandingStep } from './steps/branding-step'
import { FeaturesStep } from './steps/features-step'
import { PublishStep } from './steps/publish-step'

export function EditorContent() {
  const {
    currentStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    mode,
    save,
    isDirty,
    isSaving,
  } = useConferenceEditor()

  const renderStep = () => {
    switch (currentStep) {
      case 'overview':
        return <OverviewStep />
      case 'branding':
        return <BrandingStep />
      case 'features':
        return <FeaturesStep />
      case 'publish':
        return <PublishStep />
      default:
        return null
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Step content */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl">
        {renderStep()}
      </div>

      {/* Navigation buttons */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          {canGoPrev && (
            <Button variant="outline" onClick={prevStep} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Save button (always visible in tabs mode, or when dirty) */}
          {(mode === 'tabs' || isDirty) && currentStep !== 'publish' && (
            <Button
              variant="outline"
              onClick={save}
              disabled={isSaving || !isDirty}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}

          {/* Next/Continue button */}
          {canGoNext && (
            <Button
              onClick={nextStep}
              className="gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
            >
              {mode === 'wizard' ? 'Continue' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
