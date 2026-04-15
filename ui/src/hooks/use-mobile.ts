import * as React from "react"

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
  wide: 1536,
} as const

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.mobile - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.mobile)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < BREAKPOINTS.mobile)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<keyof typeof BREAKPOINTS | 'xs'>('mobile')

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width < BREAKPOINTS.mobile) {
        setBreakpoint('xs')
      } else if (width < BREAKPOINTS.tablet) {
        setBreakpoint('mobile')
      } else if (width < BREAKPOINTS.desktop) {
        setBreakpoint('tablet')
      } else if (width < BREAKPOINTS.wide) {
        setBreakpoint('desktop')
      } else {
        setBreakpoint('wide')
      }
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return {
    breakpoint,
    isXs: breakpoint === 'xs',
    isMobile: breakpoint === 'xs' || breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isWide: breakpoint === 'wide',
    isTouch: breakpoint === 'xs' || breakpoint === 'mobile',
  }
}
