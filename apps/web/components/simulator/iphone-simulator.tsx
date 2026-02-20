'use client'

import { ReactNode } from 'react'
import { ios } from '@makers-market/shop-ui'

interface IphoneSimulatorProps {
  children: ReactNode
  scale?: number
  className?: string
}

/**
 * iPhone 15 Pro simulator with pixel-perfect proportions
 * Based on iOS Human Interface Guidelines
 *
 * Physical dimensions: 393 x 852 logical points
 * Dynamic Island: 126 x 37.33 points, 44pt radius
 * Home Indicator: 134 x 5 points
 */
export function IphoneSimulator({
  children,
  scale = 0.7,
  className = ''
}: IphoneSimulatorProps) {
  // Base dimensions (iPhone 15 Pro logical points)
  const baseWidth = ios.device.width   // 393
  const baseHeight = ios.device.height // 852

  // Scaled dimensions for preview
  const width = baseWidth * scale
  const height = baseHeight * scale

  // Bezel and frame sizing
  const bezelWidth = 12 * scale
  const frameRadius = 54 * scale
  const screenRadius = 47 * scale

  // Dynamic Island dimensions
  const islandWidth = ios.device.dynamicIsland.width * scale   // 126
  const islandHeight = ios.device.dynamicIsland.height * scale // 37.33
  const islandRadius = 22 * scale

  // Home indicator dimensions
  const homeIndicatorWidth = ios.device.homeIndicator.width * scale // 134
  const homeIndicatorHeight = ios.device.homeIndicator.height * scale // 5

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Device Frame - Titanium finish */}
      <div className="relative">
        {/* Outer bezel with titanium gradient */}
        <div
          className="relative"
          style={{
            padding: bezelWidth,
            borderRadius: frameRadius,
            background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 30%, #2d2d2d 70%, #1a1a1a 100%)',
            boxShadow: `
              0 0 0 1px rgba(255,255,255,0.08),
              0 ${25 * scale}px ${50 * scale}px ${-12 * scale}px rgba(0,0,0,0.6),
              0 ${12 * scale}px ${24 * scale}px ${-6 * scale}px rgba(0,0,0,0.4),
              inset 0 1px 0 rgba(255,255,255,0.1),
              inset 0 -1px 0 rgba(0,0,0,0.3)
            `,
          }}
        >
          {/* Inner screen bezel */}
          <div
            className="relative overflow-hidden"
            style={{
              width,
              height,
              borderRadius: screenRadius,
              backgroundColor: '#000',
            }}
          >
            {/* Screen glass reflection effect */}
            <div
              className="absolute inset-0 z-50 pointer-events-none"
              style={{
                borderRadius: screenRadius,
                background: `
                  linear-gradient(
                    135deg,
                    rgba(255,255,255,0.12) 0%,
                    rgba(255,255,255,0.04) 25%,
                    transparent 50%,
                    transparent 75%,
                    rgba(255,255,255,0.03) 100%
                  )
                `,
              }}
            />

            {/* Dynamic Island */}
            <div
              className="absolute left-1/2 z-40"
              style={{
                top: 11 * scale,
                transform: 'translateX(-50%)',
              }}
            >
              <div
                style={{
                  width: islandWidth,
                  height: islandHeight,
                  borderRadius: islandRadius,
                  backgroundColor: '#000',
                  boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.1)',
                }}
              />
            </div>

            {/* Status Bar */}
            <div
              className="absolute top-0 left-0 right-0 z-30 flex items-end justify-between"
              style={{
                height: ios.spacing.statusBarHeight * scale,
                paddingLeft: 28 * scale,
                paddingRight: 28 * scale,
                paddingBottom: 14 * scale,
              }}
            >
              {/* Left: Time */}
              <span
                style={{
                  fontSize: 15 * scale,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  letterSpacing: 0.5 * scale,
                }}
              >
                9:41
              </span>

              {/* Right: Status icons */}
              <div className="flex items-center" style={{ gap: 4 * scale }}>
                {/* Cellular signal */}
                <svg
                  viewBox="0 0 18 12"
                  fill="none"
                  style={{ width: 17 * scale, height: 11 * scale }}
                >
                  <rect x="0" y="8" width="3" height="4" rx="0.5" fill="white" />
                  <rect x="5" y="5" width="3" height="7" rx="0.5" fill="white" />
                  <rect x="10" y="2" width="3" height="10" rx="0.5" fill="white" />
                  <rect x="15" y="0" width="3" height="12" rx="0.5" fill="white" />
                </svg>

                {/* WiFi */}
                <svg
                  viewBox="0 0 16 12"
                  fill="none"
                  style={{ width: 15 * scale, height: 11 * scale }}
                >
                  <path d="M8 2.5C10.5 2.5 12.7 3.5 14.3 5.1L15.7 3.7C13.7 1.7 11 0.5 8 0.5C5 0.5 2.3 1.7 0.3 3.7L1.7 5.1C3.3 3.5 5.5 2.5 8 2.5Z" fill="white" />
                  <path d="M8 6C9.4 6 10.7 6.5 11.7 7.4L13.1 6C11.7 4.7 9.9 4 8 4C6.1 4 4.3 4.7 2.9 6L4.3 7.4C5.3 6.5 6.6 6 8 6Z" fill="white" />
                  <path d="M8 9.5C8.8 9.5 9.5 9.8 10 10.3L11.4 8.9C10.5 8 9.3 7.5 8 7.5C6.7 7.5 5.5 8 4.6 8.9L6 10.3C6.5 9.8 7.2 9.5 8 9.5Z" fill="white" />
                  <circle cx="8" cy="11" r="1" fill="white" />
                </svg>

                {/* Battery */}
                <div className="flex items-center" style={{ marginLeft: 2 * scale }}>
                  <div
                    className="relative"
                    style={{
                      width: 25 * scale,
                      height: 12 * scale,
                      borderRadius: 3 * scale,
                      border: '1px solid rgba(255,255,255,0.5)',
                    }}
                  >
                    <div
                      className="absolute"
                      style={{
                        inset: 2 * scale,
                        right: 3 * scale,
                        borderRadius: 1.5 * scale,
                        backgroundColor: '#32D74B', // iOS battery green
                      }}
                    />
                  </div>
                  <div
                    style={{
                      width: 1.5 * scale,
                      height: 4 * scale,
                      marginLeft: 1 * scale,
                      borderRadius: `0 ${1 * scale}px ${1 * scale}px 0`,
                      backgroundColor: 'rgba(255,255,255,0.4)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Main content area */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                borderRadius: screenRadius,
                paddingTop: ios.spacing.statusBarHeight * scale,
                paddingBottom: ios.spacing.safeAreaBottom * scale,
              }}
            >
              <div className="h-full w-full overflow-hidden">
                {children}
              </div>
            </div>

            {/* Home Indicator */}
            <div
              className="absolute left-1/2 z-30"
              style={{
                bottom: 8 * scale,
                transform: 'translateX(-50%)',
              }}
            >
              <div
                style={{
                  width: homeIndicatorWidth,
                  height: homeIndicatorHeight,
                  borderRadius: homeIndicatorHeight / 2,
                  backgroundColor: 'rgba(255,255,255,0.8)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Side buttons */}
        {/* Silent/Action switch */}
        <div
          className="absolute"
          style={{
            left: -3 * scale,
            top: 100 * scale,
            width: 3 * scale,
            height: 24 * scale,
            borderRadius: `${2 * scale}px 0 0 ${2 * scale}px`,
            background: 'linear-gradient(90deg, #3a3a3a, #2a2a2a)',
          }}
        />
        {/* Volume up */}
        <div
          className="absolute"
          style={{
            left: -3 * scale,
            top: 140 * scale,
            width: 3 * scale,
            height: 32 * scale,
            borderRadius: `${2 * scale}px 0 0 ${2 * scale}px`,
            background: 'linear-gradient(90deg, #3a3a3a, #2a2a2a)',
          }}
        />
        {/* Volume down */}
        <div
          className="absolute"
          style={{
            left: -3 * scale,
            top: 185 * scale,
            width: 3 * scale,
            height: 32 * scale,
            borderRadius: `${2 * scale}px 0 0 ${2 * scale}px`,
            background: 'linear-gradient(90deg, #3a3a3a, #2a2a2a)',
          }}
        />
        {/* Power/Side button */}
        <div
          className="absolute"
          style={{
            right: -3 * scale,
            top: 160 * scale,
            width: 3 * scale,
            height: 48 * scale,
            borderRadius: `0 ${2 * scale}px ${2 * scale}px 0`,
            background: 'linear-gradient(270deg, #3a3a3a, #2a2a2a)',
          }}
        />
      </div>
    </div>
  )
}
