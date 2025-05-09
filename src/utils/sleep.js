import state from './state'

const sleep = (miliseconds) => new Promise((resolve) => setTimeout(resolve, state.options.turbo.enabled ? 10 : miliseconds))

export default sleep
