import { POPPER_HIDE_EVENT, POPPER_PROPS_DEFAULT, POPPER_SHOW_EVENT, POPPER_SHOWED_EVENT } from '@b/components/popper/types'
import { ExtractPropTypes, nextTick, onBeforeUnmount, onMounted, reactive, toRefs, watch } from 'vue'
import { AnyFunction } from '@b/common/types'
import { Ref } from '@vue/reactivity'
import { generateId } from '@b/utils/lang'
import { useThrottleFn } from '@vueuse/core'
import bus from './bus'

const usePopper = (
  props: Readonly<ExtractPropTypes<typeof POPPER_PROPS_DEFAULT>>,
  wrapperRef: Ref<HTMLElement | undefined>,
  emit: AnyFunction
) => {
  const state = reactive({
    visible: false,
    elId: 'fd-popper-' + generateId(),
    style: {
      top: '0px',
      left: '0px'
    }
  })

  let targetRect = undefined as DOMRectReadOnly | undefined

  watch(
    () => state.visible,
    (val) => {
      if (val) {
        emit(POPPER_SHOW_EVENT, wrapperRef)
        props.trigger === 'click' && document.body.addEventListener('click', onBodyClick)
      } else {
        emit(POPPER_HIDE_EVENT, wrapperRef)
        props.trigger === 'click' && document.body.removeEventListener('click', onBodyClick)
        props.trigger === 'enter' && document.body.removeEventListener('mousemove', onMouseMove)
      }
    },
    {
      flush: 'post'
    }
  )

  onMounted(() => {
    bus.on(({ event, id }) => {
      if (state.elId === id) {
        if (props.target) {
          // align with the target border
          const target = event.currentTarget as HTMLElement
          targetRect = target.getBoundingClientRect()
          const top = Math.floor(targetRect.top + targetRect.height + props.boundaryOffset)
          const left = Math.floor(targetRect.left)
          props.trigger === 'enter' && document.body.addEventListener('mousemove', onMouseMove)
          showByTarget(top, left, Math.floor(targetRect.width), Math.floor(targetRect.height))
        } else {
          // pop up at mouse cursor point
          showByMouse(event.clientY, event.clientX)
        }
      } else {
        hide()
      }
    })
  })

  onBeforeUnmount(() => {
    props.trigger === 'click' && document.body.removeEventListener('click', onBodyClick)
    props.trigger === 'enter' && document.body.removeEventListener('mousemove', onMouseMove)
  })

  const onBodyClick = (event: MouseEvent) => {
    const isInter = event.composedPath().some((item) => {
      const elementId = (item as HTMLElement).id
      return !!elementId && (elementId === state.elId || elementId === state.elId)
    })
    if (!isInter) {
      hide()
    }
  }

  const mouseOutRect = (event: MouseEvent, rect: DOMRectReadOnly, offset = 0) => {
    const left = rect.left + window.scrollX
    const top = rect.top + window.scrollY
    const innerX = event.clientX - left
    const innerY = event.clientY - top
    return rect.width === 0 || rect.height === 0 || innerX < 0 || innerY < -offset || innerX > rect.width || innerY > rect.height
  }

  const mouseMoveCb = (event: MouseEvent) => {
    const el = wrapperRef.value as HTMLElement
    if (mouseOutRect(event, targetRect as DOMRectReadOnly) && mouseOutRect(event, el.getBoundingClientRect(), props.boundaryOffset)) {
      hide()
    }
  }
  const onMouseMove = useThrottleFn(mouseMoveCb, props.hideDelay)

  const showByMouse = (top: number, left: number) => {
    const el = wrapperRef.value as HTMLElement
    window.setTimeout(() => {
      state.visible = true
      nextTick(() => {
        const w = el.clientWidth
        const h = el.clientHeight
        if (top + h + props.boundaryOffset >= document.body.clientHeight) {
          top = Math.max(top - h, props.boundaryOffset)
        }
        if (left + w + props.boundaryOffset >= document.body.clientWidth) {
          left = Math.max(left - w, props.boundaryOffset)
        }
        state.style = {
          top: `${top}px`,
          left: `${left}px`
        }
        emit(POPPER_SHOWED_EVENT, wrapperRef)
      })
    }, props.showDelay)
  }

  const showByTarget = (top: number, left: number, targetW: number, targetH: number) => {
    const el = wrapperRef.value as HTMLElement
    if (props.trigger === 'click' && state.visible) {
      hide()
      return
    }
    window.setTimeout(() => {
      state.visible = true
      nextTick(() => {
        const w = el.clientWidth
        const h = el.clientHeight
        if (top + h + props.boundaryOffset >= document.body.clientHeight) {
          const calcTop = top - h - targetH - props.boundaryOffset * 2
          top = calcTop >= props.boundaryOffset ? calcTop : props.boundaryOffset
        }
        if (left < 0) {
          left = props.boundaryOffset
        }
        if (left + w + props.boundaryOffset >= document.body.clientWidth) {
          left = Math.max(document.body.clientWidth - w - props.boundaryOffset, props.boundaryOffset)
        }
        state.style = {
          top: `${top}px`,
          left: `${left}px`
        }
        emit(POPPER_SHOWED_EVENT, wrapperRef)
      })
    }, props.showDelay)
  }

  const show = (e: PointerEvent) => {
    if (!props.disabled) {
      bus.emit({ event: e, id: state.elId })
    }
  }

  const hide = () => {
    state.visible = false
  }

  const { visible, elId, style } = toRefs(state)

  return {
    visible,
    elId,
    style,
    show,
    hide
  }
}

export default usePopper
