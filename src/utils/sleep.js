import state from './state'

function sleep(miliseconds, override = false) {
    if (override) { return new Promise(resolve => setTimeout(resolve, miliseconds)); }
    else { return new Promise(resolve => setTimeout(resolve, state.options.turbo.enabled ? Math.min(50, miliseconds) : miliseconds)); }
};

export default sleep
