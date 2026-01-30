'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Check, FileText, Palette, LayoutGrid, Rocket } from 'lucide-react'
import { useConferenceEditor, type EditorStep } from '@/contexts/conference-editor-context'

const STEPS: { id: EditorStep; name: string; description: string; icon: typeof FileText }[] = [
  { id: 'overview', name: 'Overview', description: 'Event details', icon: FileText },
  { id: 'branding', name: 'Branding', description: 'Colors & style', icon: Palette },
  { id: 'features', name: 'Features', description: 'App modules', icon: LayoutGrid },
  { id: 'publish', name: 'Publish', description: 'Go live', icon: Rocket },
]

export function EditorStepper() {
  const { currentStep, setStep, stepIndex, mode } = useConferenceEditor()

  // In tabs mode, all steps are clickable. In wizard mode, only completed steps.
  const canClickStep = (idx: number) => {
    if (mode === 'tabs') return true
    return idx <= stepIndex
  }

  // Calculate progress percentage
  const progressPercent = (stepIndex / (STEPS.length - 1)) * 100

  return (
    <div className="relative rounded-2xl border border-slate-200/80 bg-white/90 px-6 py-5 shadow-sm backdrop-blur-xl">
      {/* Background progress track */}
      <div className="absolute left-[72px] right-[72px] top-[42px] h-[2px] bg-slate-100" />

      {/* Animated progress fill */}
      <motion.div
        className="absolute left-[72px] top-[42px] h-[2px] bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500"
        initial={{ width: 0 }}
        animate={{
          width: `calc((100% - 144px) * ${progressPercent / 100})`,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      />

      <nav aria-label="Progress">
        <ol className="relative flex items-start justify-between">
          {STEPS.map((step, index) => {
            const isComplete = stepIndex > index
            const isCurrent = currentStep === step.id
            const isClickable = canClickStep(index)

            return (
              <li key={step.id} className="relative z-10 flex flex-col items-center">
                <motion.button
                  onClick={() => isClickable && setStep(step.id)}
                  className={cn(
                    'group relative flex flex-col items-center outline-none',
                    isClickable ? 'cursor-pointer' : 'cursor-default'
                  )}
                  whileHover={isClickable ? { scale: 1.05 } : undefined}
                  whileTap={isClickable ? { scale: 0.95 } : undefined}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  {/* Step circle */}
                  <motion.span
                    className={cn(
                      'relative flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors duration-200',
                      isComplete
                        ? 'border-transparent bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/30'
                        : isCurrent
                        ? 'border-blue-500 bg-white text-blue-600 shadow-lg shadow-blue-500/20'
                        : 'border-slate-200 bg-white text-slate-400'
                    )}
                  >
                    {isComplete ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <Check className="h-5 w-5" strokeWidth={2.5} />
                      </motion.div>
                    ) : (
                      <step.icon className="h-5 w-5" strokeWidth={isCurrent ? 2.5 : 2} />
                    )}
                  </motion.span>

                  {/* Step label */}
                  <span className="mt-3 text-center">
                    <span
                      className={cn(
                        'block text-sm font-semibold transition-colors',
                        isCurrent
                          ? 'text-blue-600'
                          : isComplete
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      )}
                    >
                      {step.name}
                    </span>
                    <span
                      className={cn(
                        'block text-xs transition-colors',
                        isCurrent || isComplete ? 'text-slate-500' : 'text-slate-400'
                      )}
                    >
                      {step.description}
                    </span>
                  </span>

                  {/* Current step indicator */}
                  {isCurrent && (
                    <motion.div
                      className="absolute -bottom-1 h-1 w-8 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                      layoutId="currentStepIndicator"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                  )}
                </motion.button>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Mode indicator */}
      {mode === 'tabs' && (
        <div className="mt-4 flex items-center justify-center">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
            Click any step to jump
          </span>
        </div>
      )}
    </div>
  )
}
