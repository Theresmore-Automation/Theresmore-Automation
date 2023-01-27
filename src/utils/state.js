import localStorage from './localStorage'
import CONSTANTS from './constants'

let scriptPaused = true
if (typeof localStorage.get('scriptPaused') !== 'undefined') {
  scriptPaused = localStorage.get('scriptPaused')
}

const state = {
  scriptPaused,
  lastVisited: {
    [CONSTANTS.PAGES.BUILD]: -1,
    [CONSTANTS.PAGES.RESEARCH]: 0,
    [CONSTANTS.PAGES.POPULATION]: 0,
    [CONSTANTS.PAGES.ARMY]: 0,
    [CONSTANTS.PAGES.MARKETPLACE]: 0,
  },
}

export default state
