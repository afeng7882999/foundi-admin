import { useBreakpoints } from '@vueuse/core'

export const breakpoints = {
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1920
}

export const breakpoint = useBreakpoints(breakpoints)

const useBreakpoint = () => {
  const isMobile = breakpoint.smaller('sm')

  return {
    isMobile
  }
}

export default useBreakpoint
