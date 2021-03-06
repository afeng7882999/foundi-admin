import type { ObjectDirective } from 'vue'
import './waves.css'

const WavesDirective: ObjectDirective = {
  beforeMount(el, binding): void {
    el.addEventListener(
      'click',
      (e: MouseEvent) => {
        const customOpts = Object.assign({}, binding.value)
        const opts = Object.assign(
          {
            ele: el,
            type: 'hit',
            color: 'rgba(0, 0, 0, 0.15)'
          },
          customOpts
        )
        const target = opts.ele
        if (target) {
          target.style.position = 'relative'
          target.style.overflow = 'hidden'
          const rect = target.getBoundingClientRect()
          let ripple = target.querySelector('.waves-ripple')
          if (!ripple) {
            ripple = document.createElement('span')
            ripple.className = 'fd-waves-ripple'
            ripple.style.height = ripple.style.width = Math.max(rect.width, rect.height) + 'px'
            target.appendChild(ripple)
          } else {
            ripple.className = 'fd-waves-ripple'
          }
          switch (opts.type) {
            case 'center':
              ripple.style.top = rect.height / 2 - ripple.offsetHeight / 2 + 'px'
              ripple.style.left = rect.width / 2 - ripple.offsetWidth / 2 + 'px'
              break
            default:
              ripple.style.top =
                (e.pageY - rect.top - ripple.offsetHeight / 2 - document.documentElement.scrollTop || document.body.scrollTop) + 'px'
              ripple.style.left =
                (e.pageX - rect.left - ripple.offsetWidth / 2 - document.documentElement.scrollLeft || document.body.scrollLeft) + 'px'
          }
          ripple.style.backgroundColor = opts.color
          ripple.className = 'fd-waves-ripple is-active'
          return false
        }
      },
      false
    )
  }
}

export default WavesDirective
