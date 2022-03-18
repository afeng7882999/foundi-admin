import { useBreakpoints } from '@vueuse/core'

export const breakpoints = {
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1920
}

const useBreakpoint = () => {
  const breakpoint = useBreakpoints(breakpoints)

  return {
    breakpoint
  }
}

export default useBreakpoint
