import localStorage from './localStorage'
import CONSTANTS from './constants'

const state = {
  scriptPaused: true,
  lastVisited: {
    [CONSTANTS.PAGES.BUILD]: 0,
    [CONSTANTS.PAGES.RESEARCH]: 0,
    [CONSTANTS.PAGES.POPULATION]: 0,
    [CONSTANTS.PAGES.ARMY]: 0,
    [CONSTANTS.PAGES.MARKETPLACE]: 0,
  },
  buildings: [],
  options: {
    pages: {
      [CONSTANTS.PAGES.BUILD]: true,
      [CONSTANTS.PAGES.RESEARCH]: true,
      [CONSTANTS.PAGES.POPULATION]: true,
      [CONSTANTS.PAGES.ARMY]: false,
      [CONSTANTS.PAGES.MARKETPLACE]: true,
    },
    subpages: {
      [CONSTANTS.SUBPAGES.PRAYERS]: false,
    },
    [CONSTANTS.PAGES.BUILD]: {},
    [CONSTANTS.PAGES.RESEARCH]: {},
    [CONSTANTS.PAGES.POPULATION]: {},
    [CONSTANTS.PAGES.ARMY]: {},
    [CONSTANTS.PAGES.MARKETPLACE]: {},
    automation: {},
  },
  haveManualResourceButtons: true,
}

if (typeof localStorage.get('scriptPaused') !== 'undefined') {
  state.scriptPaused = localStorage.get('scriptPaused')
}

if (typeof localStorage.get('options') !== 'undefined') {
  state.options = { ...state.options, ...localStorage.get('options') }
}

if (typeof localStorage.get('lastVisited') !== 'undefined') {
  state.lastVisited = { ...state.lastVisited, ...localStorage.get('lastVisited') }
}

export default state
