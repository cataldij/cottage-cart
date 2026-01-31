'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface DesktopBrowserProps {
  children: ReactNode
  url?: string
  scale?: number
  className?: string
}

/**
 * Professional macOS Safari-style browser frame
 * Pixel-perfect recreation for realistic desktop preview
 */
export function DesktopBrowser({
  children,
  url = 'conference.app',
  scale = 0.5,
  className = '',
}: DesktopBrowserProps) {
  const baseWidth = 1280
  const baseHeight = 800

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative"
        style={{
          width: baseWidth * scale,
          filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.25))',
        }}
      >
        {/* Browser window frame */}
        <div
          className="overflow-hidden rounded-xl"
          style={{
            background: 'linear-gradient(180deg, #e8e8e8 0%, #d4d4d4 100%)',
            boxShadow: `
              0 0 0 1px rgba(0,0,0,0.1),
              inset 0 1px 0 rgba(255,255,255,0.8)
            `,
          }}
        >
          {/* Title bar / Chrome */}
          <div
            className="flex items-center"
            style={{
              height: 52 * scale,
              padding: `0 ${12 * scale}px`,
              background: 'linear-gradient(180deg, #f6f6f6 0%, #e8e8e8 100%)',
              borderBottom: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            {/* Traffic light buttons */}
            <div
              className="flex items-center"
              style={{ gap: 8 * scale }}
            >
              <div
                style={{
                  width: 12 * scale,
                  height: 12 * scale,
                  borderRadius: '50%',
                  background: 'linear-gradient(180deg, #ff5f57 0%, #e0443e 100%)',
                  boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.1)',
                }}
              />
              <div
                style={{
                  width: 12 * scale,
                  height: 12 * scale,
                  borderRadius: '50%',
                  background: 'linear-gradient(180deg, #febc2e 0%, #dea123 100%)',
                  boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.1)',
                }}
              />
              <div
                style={{
                  width: 12 * scale,
                  height: 12 * scale,
                  borderRadius: '50%',
                  background: 'linear-gradient(180deg, #28c840 0%, #1aab29 100%)',
                  boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.1)',
                }}
              />
            </div>

            {/* URL bar */}
            <div
              className="flex-1 flex items-center justify-center"
              style={{ marginLeft: 80 * scale, marginRight: 80 * scale }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: '100%',
                  maxWidth: 500 * scale,
                  height: 28 * scale,
                  borderRadius: 6 * scale,
                  background: 'rgba(0,0,0,0.05)',
                  border: '1px solid rgba(0,0,0,0.08)',
                }}
              >
                {/* Lock icon */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    width: 12 * scale,
                    height: 12 * scale,
                    color: '#6b7280',
                    marginRight: 6 * scale,
                  }}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span
                  style={{
                    fontSize: 12 * scale,
                    color: '#6b7280',
                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  {url}
                </span>
              </div>
            </div>
          </div>

          {/* Browser content area */}
          <div
            style={{
              width: baseWidth * scale,
              height: (baseHeight - 52) * scale,
              overflow: 'hidden',
              backgroundColor: '#ffffff',
            }}
          >
            {/* Scale the content to fit */}
            <div
              style={{
                width: baseWidth,
                height: baseHeight - 52,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                overflow: 'auto',
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Professional iPad-style tablet frame
 */
export function TabletFrame({
  children,
  scale = 0.5,
  className = '',
}: {
  children: ReactNode
  scale?: number
  className?: string
}) {
  const baseWidth = 834  // iPad Pro 11" logical width
  const baseHeight = 1194 // iPad Pro 11" logical height

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        {/* Tablet frame - Space Gray finish */}
        <div
          style={{
            padding: 16 * scale,
            borderRadius: 24 * scale,
            background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 30%, #2d2d2d 70%, #1a1a1a 100%)',
            boxShadow: `
              0 0 0 1px rgba(255,255,255,0.08),
              0 ${30 * scale}px ${60 * scale}px ${-15 * scale}px rgba(0,0,0,0.5),
              inset 0 1px 0 rgba(255,255,255,0.1)
            `,
          }}
        >
          {/* Screen */}
          <div
            style={{
              width: baseWidth * scale,
              height: baseHeight * scale,
              borderRadius: 18 * scale,
              overflow: 'hidden',
              backgroundColor: '#000',
            }}
          >
            {/* Camera - top center */}
            <div
              className="absolute left-1/2 z-50"
              style={{
                top: 8 * scale,
                transform: 'translateX(-50%)',
              }}
            >
              <div
                style={{
                  width: 8 * scale,
                  height: 8 * scale,
                  borderRadius: '50%',
                  background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                }}
              />
            </div>

            {/* Content */}
            <div
              style={{
                width: baseWidth,
                height: baseHeight,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                overflow: 'auto',
                backgroundColor: '#ffffff',
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
