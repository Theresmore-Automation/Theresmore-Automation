import state from './state'

function sleep(miliseconds, force = false) {
  if (state.options.turbo.enabled && !force) {
    return new Promise((resolve) => setTimeout(resolve, Math.min(state.options.turbo.maxSleep, miliseconds)))
  } else {
    return new Promise((resolve) => setTimeout(resolve, miliseconds))
  }
}

export default sleep
