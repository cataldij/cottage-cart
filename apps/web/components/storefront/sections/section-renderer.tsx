'use client'

import type { ComponentType } from 'react'
import type { StorefrontSectionType } from '@/lib/builder-sections'
import type { SectionProps } from './types'
import { getSectionSpacingClass } from './types'
import { HeroSection } from './hero-section'
import { FeaturedProductsSection } from './featured-products-section'
import { AllProductsSection } from './all-products-section'
import { AboutSection } from './about-section'
import { HoursSection } from './hours-section'
import { PickupSection } from './pickup-section'
import { ReviewsSection } from './reviews-section'
import { FAQSection } from './faq-section'
import { NewsletterSection } from './newsletter-section'
import { CustomTextSection } from './custom-text-section'
import { DividerSection } from './divider-section'
import { SpacerSection } from './spacer-section'

const SECTION_COMPONENTS: Record<string, ComponentType<SectionProps>> = {
  hero: HeroSection,
  featured_products: FeaturedProductsSection,
  all_products: AllProductsSection,
  about_me: AboutSection,
  reviews: ReviewsSection,
  pickup_details: PickupSection,
  shop_hours: HoursSection,
  faq: FAQSection,
  newsletter_signup: NewsletterSection,
  custom_text: CustomTextSection,
  divider: DividerSection,
  spacer: SpacerSection,
}

// Sections that render as compact sidebar-style cards (group them horizontally)
const SIDEBAR_TYPES = new Set(['about_me', 'shop_hours', 'pickup_details'])

interface StorefrontSection {
  id: string
  sectionType: string
  config: Record<string, unknown>
  isVisible: boolean
}

interface SectionRendererProps {
  sections: StorefrontSection[]
  sectionProps: SectionProps
}

export function SectionRenderer({ sections, sectionProps }: SectionRendererProps) {
  const visibleSections = sections.filter((s) => s.isVisible)

  // Group consecutive sidebar sections together for horizontal layout
  const groups: Array<{ type: 'main'; section: StorefrontSection } | { type: 'sidebar'; sections: StorefrontSection[] }> = []

  for (const section of visibleSections) {
    if (SIDEBAR_TYPES.has(section.sectionType)) {
      const lastGroup = groups[groups.length - 1]
      if (lastGroup?.type === 'sidebar') {
        lastGroup.sections.push(section)
      } else {
        groups.push({ type: 'sidebar', sections: [section] })
      }
    } else {
      groups.push({ type: 'main', section })
    }
  }

  return (
    <>
      {groups.map((group, groupIndex) => {
        if (group.type === 'main') {
          const Component = SECTION_COMPONENTS[group.section.sectionType]
          if (!Component) return null
          return (
            <Component
              key={group.section.id}
              {...sectionProps}
              config={group.section.config}
            />
          )
        }

        // Sidebar group — render as responsive card row
        return (
          <div
            key={`sidebar-group-${groupIndex}`}
            className={`${getSectionSpacingClass(sectionProps.theme.advanced)} grid gap-4 sm:grid-cols-2 lg:grid-cols-3`}
          >
            {group.sections.map((section) => {
              const Component = SECTION_COMPONENTS[section.sectionType]
              if (!Component) return null
              return (
                <Component
                  key={section.id}
                  {...sectionProps}
                  config={section.config}
                />
              )
            })}
          </div>
        )
      })}
    </>
  )
}
