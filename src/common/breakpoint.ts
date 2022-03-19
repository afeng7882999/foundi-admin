import { useBreakpoints } from '@vueuse/core'

export const breakpoints = {
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1920
}

const breakpoint = useBreakpoints(breakpoints)

export default breakpoint
