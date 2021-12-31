import mitt from 'mitt'
// contextmenu show event
export const ContextmenuShowEvent = Symbol('show-contextmenu')
// define event bus
const emitter = mitt()
export default emitter
