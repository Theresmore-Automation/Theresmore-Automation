import localStorage from './localStorage'
import CONSTANTS from './constants'

const state = {
  scriptPaused: true,
  haveManualResourceButtons: true,
  lastVisited: {},
  buildings: [],
  options: {
    pages: {},
    ancestor: {
      enabled: false,
      selected: '',
    },
    prestige: {
      enabled: false,
      selected: '',
    },
    cosmetics: {
      hideFullPageOverlay: {
        enabled: false,
      },
      toasts: {
        enabled: false,
      },
    },
  },
}

Object.keys(CONSTANTS.PAGES).every((key) => {
  state.options.pages[CONSTANTS.PAGES[key]] = {
    enabled: false,
    page: CONSTANTS.PAGES[key],
    subpages: {},
    options: {},
  }

  return state.options.pages[CONSTANTS.PAGES[key]]
})

Object.keys(CONSTANTS.SUBPAGES).every((key) => {
  const parent = CONSTANTS.PAGES[CONSTANTS.SUBPAGE_MAPPING[key]]

  state.options.pages[parent].subpages[CONSTANTS.SUBPAGES[key]] = {
    enabled: false,
    subpage: CONSTANTS.SUBPAGES[key],
    options: {},
  }

  return state.options.pages[parent].subpages[CONSTANTS.SUBPAGES[key]]
})

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
