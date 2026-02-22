import type { SectionProps } from './types'

const HEIGHTS: Record<string, string> = {
  sm: 'h-6',
  md: 'h-12',
  lg: 'h-20',
  xl: 'h-32',
}

export function SpacerSection({ config }: SectionProps) {
  const height = (config.height as string) || 'md'
  return <div className={HEIGHTS[height] || HEIGHTS.md} />
}
