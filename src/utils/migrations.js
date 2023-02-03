import localStorage from './localStorage'
import CONSTANTS from './constants'
import state from './state'

const lastMigration = localStorage.get('lastMigration') || 0

const migrations = [
  () => {
    if (!Array.isArray(state.options.pages)) {
      const newPages = []

      Object.keys(state.options.pages).forEach((key) => {
        newPages.push({
          enabled: state.options.pages[key],
          page: key,
          subpages: [],
          options: { ...state.options[key] },
        })
      })

      state.options.pages = newPages
      localStorage.set('options', state.options)
    }
  },
  () => {
    const research = state.options.pages.find((page) => page.page === CONSTANTS.PAGES.RESEARCH)
    if (research && research.options) {
      Object.keys(research.options).forEach((key) => {
        if (key.includes('tech_')) {
          delete research.options[key]
        }
      })

      localStorage.set('options', state.options)
    }
  },
]

const runMigrations = () => {
  for (let i = lastMigration; i < migrations.length; i++) {
    migrations[i]()
  }
  localStorage.set('lastMigration', migrations.length)
}

export default runMigrations
