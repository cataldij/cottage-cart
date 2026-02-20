'use client'

import { motion } from 'framer-motion'
import { useBuilder } from '@/contexts/builder-context'
import { cn } from '@/lib/utils'
import { Check, FileText, Palette, LayoutGrid, Rocket } from 'lucide-react'

const STEPS = [
  { id: 0, name: 'Overview', description: 'Shop details', icon: FileText },
  { id: 1, name: 'Branding', description: 'Look and feel', icon: Palette },
  { id: 2, name: 'Navigation', description: 'Customer app tabs', icon: LayoutGrid },
  { id: 3, name: 'Publish', description: 'Launch storefront', icon: Rocket },
]

export function BuilderStepper() {
  const { currentStep, setStep } = useBuilder()

  // Calculate progress percentage for the animated line
  const progressPercent = (currentStep / (STEPS.length - 1)) * 100

  return (
    <div className="relative rounded-2xl border border-slate-200/80 bg-white/90 px-6 py-5 shadow-sm backdrop-blur-xl">
      {/* Background progress track */}
      <div className="absolute left-[72px] right-[72px] top-[42px] h-[2px] bg-slate-100" />

      {/* Animated progress fill */}
      <motion.div
        className="absolute left-[72px] top-[42px] h-[2px] bg-gradient-to-r from-emerald-600 via-amber-600 to-orange-600"
        initial={{ width: 0 }}
        animate={{
          width: `calc(${progressPercent}% * ((100% - 144px) / 100))`,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        style={{
          width: `calc((100% - 144px) * ${progressPercent / 100})`,
        }}
      />

      <nav aria-label="Progress">
        <ol className="relative flex items-start justify-between">
          {STEPS.map((step, index) => {
            const isComplete = currentStep > step.id
            const isCurrent = currentStep === step.id
            const isClickable = true

            return (
              <li key={step.name} className="relative z-10 flex flex-col items-center">
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
                        ? 'border-transparent bg-gradient-to-br from-emerald-600 to-amber-600 text-white shadow-lg shadow-emerald-500/25'
                        : isCurrent
                        ? 'border-emerald-600 bg-white text-emerald-700 shadow-lg shadow-emerald-500/15'
                        : 'border-slate-200 bg-white text-slate-400'
                    )}
                    initial={false}
                    animate={{
                      scale: isCurrent ? 1 : 1,
                    }}
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
                          ? 'text-emerald-700'
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

                  {/* Current step indicator dot */}
                  {isCurrent && (
                    <motion.div
                      className="absolute -bottom-1 h-1 w-8 rounded-full bg-gradient-to-r from-emerald-600 to-amber-600"
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

      {/* Step counter */}
      <div className="mt-4 flex items-center justify-center gap-2 text-sm">
        <span className="text-slate-400">Step</span>
        <span className="font-mono text-lg font-semibold text-slate-900">
          {currentStep + 1}
        </span>
        <span className="text-slate-400">of {STEPS.length}</span>
      </div>
    </div>
  )
}
