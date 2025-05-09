import localStorage from './localStorage'
import CONSTANTS from './constants'

export const getDefaultOptions = () => {
  const options = {
    pages: {},
    ancestor: {
      enabled: false,
      selected: '',
    },
    prestige: {
      enabled: false,
      selected: '',
      options: {},
    },
    difficulty: {
      enabled: false,
      selected: '',
    },
    ngplus: {
      enabled: false,
      value: 0,
    },
    cosmetics: {
      hideFullPageOverlay: {
        enabled: false,
      },
      toasts: {
        enabled: false,
      },
    },
    turbo: {
      enabled: false,
    },
    lastMigration: 3,
    version: taVersion,
  }

  Object.keys(CONSTANTS.PAGES).every((key) => {
    options.pages[CONSTANTS.PAGES[key]] = {
      enabled: false,
      page: CONSTANTS.PAGES[key],
      subpages: {},
      options: {},
    }

    return options.pages[CONSTANTS.PAGES[key]]
  })

  Object.keys(CONSTANTS.SUBPAGES).every((key) => {
    const parent = CONSTANTS.PAGES[CONSTANTS.SUBPAGE_MAPPING[key]]

    options.pages[parent].subpages[CONSTANTS.SUBPAGES[key]] = {
      enabled: false,
      subpage: CONSTANTS.SUBPAGES[key],
      options: {},
    }

    return options.pages[parent].subpages[CONSTANTS.SUBPAGES[key]]
  })

  return options
}

const state = {
  scriptPaused: true,
  haveManualResourceButtons: true,
  stopAutoClicking: false,
  lastVisited: {},
  buildings: [],
  options: getDefaultOptions(),
  MainStore: null,
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
