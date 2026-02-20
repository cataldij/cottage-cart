'use client'

import { BuilderProvider } from '@/contexts/builder-context'
import { BuilderStepper } from '@/components/builder/builder-stepper'
import { BuilderContent } from '@/components/builder/builder-content'
import { BuilderPreview } from '@/components/builder/builder-preview'

export default function BuilderPage() {
  return (
    <BuilderProvider>
      <div className="flex h-[calc(100vh-12rem)] flex-col gap-4">
        {/* Stepper */}
        <BuilderStepper />

        {/* Main Content */}
        <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Left: Step Content */}
          <div className="flex-1 overflow-y-auto">
            <BuilderContent />
          </div>

          {/* Right: Live Preview */}
          <div className="w-[500px] shrink-0">
            <BuilderPreview />
          </div>
        </div>
      </div>
    </BuilderProvider>
  )
}
