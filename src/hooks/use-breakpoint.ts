import { useBreakpoints } from '@vueuse/core'
import { ref } from 'vue'

export const breakpoints = {
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1920
}

export const breakpoint = useBreakpoints(breakpoints)

const useBreakpoint = (react: boolean | undefined = true) => {
  const isMobile = react ? breakpoint.smaller('sm') : ref(false)

  return {
    isMobile
  }
}

export default useBreakpoint
