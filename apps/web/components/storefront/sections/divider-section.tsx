import type { SectionProps } from './types'

export function DividerSection({ theme }: SectionProps) {
  const { textColor } = theme

  return (
    <div className="my-8">
      <hr style={{ borderColor: `${textColor}18` }} />
    </div>
  )
}
