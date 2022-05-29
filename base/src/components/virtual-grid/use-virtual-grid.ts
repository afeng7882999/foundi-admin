import { computed, ExtractPropTypes, reactive, ref, toRefs, watch } from 'vue'
import { GRID_DEFAULT_PROPS } from '@b/components/virtual-grid/types'
import useGrid from '@b/components/virtual-grid/use-grid'
import { AnyFunction, Indexable } from '@b/common/types'

const useVirtualGrid = (props: Readonly<ExtractPropTypes<typeof GRID_DEFAULT_PROPS>>, emit: AnyFunction) => {
  const wrapperRef = ref<HTMLElement>()
  const viewRef = ref<HTMLElement>()
  const innerRef = ref<HTMLElement>()

  const {
    wrapperRect,
    itemHeight: itemHeightCal,
    buffer,
    viewHeight,
    innerTranslate,
    lessThanRowSize,
    loading,
    scrollToIdx,
    scrollToPage,
    refresh,
    refreshBuffer
  } = useGrid(props, emit, wrapperRef, viewRef, innerRef)

  const state = reactive({
    loadingStyle: {} as Indexable,
    loadingVisible: false
  })

  const wrapperClassCo = computed(() => {
    const clazz = []
    if (props.windowMode) {
      clazz.push('is-window')
    }
    if (props.isMobile) {
      clazz.push('is-mobile')
    }
    return clazz.join(' ')
  })

  const viewStyleCo = computed(() => {
    return {
      height: `${viewHeight.value + props.gridGap}px`,
      paddingBottom: `${props.gridGap}px`
    }
  })

  const innerStyleCo = computed(() => {
    const style = {
      width: '100%',
      transform: `translate3d(0px, ${innerTranslate.value}px, 0px)`
    } as Indexable

    if (props.isMobile) {
      style.gridTemplateColumns = '1fr'
      return style
    }

    style.gap = `${props.gridGap}px`
    if (props.itemWidth) {
      style.gridTemplateColumns = `repeat(auto-fit, ${props.itemWidth}px)`
    } else if (props.itemMinWidth) {
      style.gridTemplateColumns = lessThanRowSize.value
        ? `repeat(auto-fit, ${props.itemMinWidth}px)`
        : `repeat(auto-fit, minmax(${props.itemMinWidth}px, 1fr))`
    }

    return style
  })

  watch(
    () => loading.value,
    (val) => {
      if (val && props.windowMode) {
        const top = Math.max(wrapperRef.value?.getBoundingClientRect().top as number, 0)
        state.loadingStyle.top = `${top}px`
        state.loadingStyle.left = 0
        state.loadingStyle.width = `${window.innerWidth}px`
        state.loadingStyle.height = `${window.innerHeight - top}px`
      }
      state.loadingVisible = val
    },
    { immediate: true }
  )

  const { loadingStyle, loadingVisible } = toRefs(state)
  return {
    wrapperRef,
    viewRef,
    innerRef,
    wrapperRect,
    itemHeightCal,
    buffer,
    loadingStyle,
    loadingVisible,
    scrollToIdx,
    scrollToPage,
    refresh,
    refreshBuffer,
    wrapperClassCo,
    viewStyleCo,
    innerStyleCo
  }
}

export default useVirtualGrid
