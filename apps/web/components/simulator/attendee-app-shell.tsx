'use client'

import { ReactNode } from 'react'
import {
  ios,
  CompactTabBar,
  type TabItem,
} from '@makers-market/shop-ui'
import {
  Home,
  ShoppingBag,
  ClipboardList,
  MapPin,
  User,
} from 'lucide-react'

// Default tabs for the customer app
export const DEFAULT_TABS: TabItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'catalog', label: 'Shop', icon: ShoppingBag },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'pickup', label: 'Pickup', icon: MapPin },
  { id: 'account', label: 'Account', icon: User },
]

interface AttendeeAppShellProps {
  tabs?: TabItem[]
  activeTabId: string
  onTabChange: (tabId: string) => void
  primaryColor?: string
  backgroundColor?: string
  children: ReactNode
  scale?: number
}

/**
 * Shell component for the customer app preview
 * Uses shared components from @makers-market/shop-ui
 */
export function AttendeeAppShell({
  tabs = DEFAULT_TABS,
  activeTabId,
  onTabChange,
  primaryColor = ios.colors.systemBlue,
  backgroundColor = ios.colors.systemBackground,
  children,
  scale = 0.7,
}: AttendeeAppShellProps) {
  return (
    <div
      className="flex h-full flex-col relative"
      style={{ backgroundColor }}
    >
      {/* Main content area */}
      <div
        className="flex-1 overflow-hidden"
        style={{
          // Leave room for tab bar
          paddingBottom: ios.spacing.tabBarHeight * scale,
        }}
      >
        {children}
      </div>

      {/* iOS-style Tab Bar using shared component */}
      <CompactTabBar
        tabs={tabs}
        activeTab={activeTabId}
        onTabChange={onTabChange}
        accentColor={primaryColor}
        scale={scale}
      />
    </div>
  )
}
