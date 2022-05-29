// for scss:
//
// @mixins expandTransition($duration) {
// &.expand-enter-active, &.expand-leave-active {
//     transition: height $duration ease;
//     overflow: hidden;
//   }
// &.expand-enter, &.expand-leave-to {
//     height: 0 !important;
//   }
// }

export default function () {
  const expandEnter = (el: HTMLElement) => {
    el.style.height = el.scrollHeight + 'px'
  }

  const expandAfterEnter = (el: HTMLElement) => {
    el.style.height = 'auto'
  }

  const expandBeforeLeave = (el: HTMLElement) => {
    el.style.height = el.scrollHeight + 'px'
  }

  return {
    expandEnter,
    expandAfterEnter,
    expandBeforeLeave
  }
}
