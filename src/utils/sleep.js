import state from './state'

function sleep(miliseconds, override = false) {
    if (state.options.turbo.enabled && !override) { return new Promise(resolve => setTimeout(resolve, Math.min(state.options.turbo.maxSleep, miliseconds))); }
    else { return new Promise(resolve => setTimeout(resolve, miliseconds)); }
};

export default sleep
