import localStorage from './localStorage'
import CONSTANTS from './constants'
import state, { getDefaultOptions } from './state'
import { buildings } from '../data'

const migrations = [
  () => {
    if (typeof state.options.pages[CONSTANTS.PAGES.BUILD] !== 'object') {
      const newOptions = getDefaultOptions()

      Object.keys(CONSTANTS.PAGES).every((key) => {
        newOptions.pages[CONSTANTS.PAGES[key]] = {
          enabled: false,
          page: CONSTANTS.PAGES[key],
          subpages: {},
          options: {},
        }

        return newOptions.pages[CONSTANTS.PAGES[key]]
      })

      Object.keys(CONSTANTS.SUBPAGES).every((key) => {
        const parent = CONSTANTS.PAGES[CONSTANTS.SUBPAGE_MAPPING[key]]

        newOptions.pages[parent].subpages[CONSTANTS.SUBPAGES[key]] = {
          enabled: false,
          subpage: CONSTANTS.SUBPAGES[key],
          options: {},
        }

        return newOptions.pages[parent].subpages[CONSTANTS.SUBPAGES[key]]
      })

      Object.keys(state.options.pages).forEach((key) => {
        newOptions.pages[key].enabled = state.options.pages[key] || false

        if (key === CONSTANTS.PAGES.RESEARCH) {
          Object.keys(state.options[key]).forEach((key) => {
            if (key.includes('tech_')) {
              delete state.options[key]
            }
          })

          newOptions.pages[key].subpages[CONSTANTS.SUBPAGES.RESEARCH].enabled = newOptions.pages[key].enabled
          newOptions.pages[key].subpages[CONSTANTS.SUBPAGES.RESEARCH].options = state.options[key]
        } else if (key === CONSTANTS.PAGES.BUILD) {
          newOptions.pages[key].subpages[CONSTANTS.SUBPAGES.CITY].enabled = newOptions.pages[key].enabled
          newOptions.pages[key].subpages[CONSTANTS.SUBPAGES.COLONY].enabled = newOptions.pages[key].enabled

          Object.keys(state.options[key]).forEach((id) => {
            const building = buildings.find((building) => building.id === id)

            if (building) {
              const subPage = building.tab === 1 ? CONSTANTS.SUBPAGES.CITY : CONSTANTS.SUBPAGES.COLONY

              newOptions.pages[key].subpages[subPage].options[id] = state.options[key][id]
              newOptions.pages[key].subpages[subPage].options[`prio_${id}`] = state.options[key][`prio_${id}`]
            }
          })

          newOptions.pages[key].options.prioWonders = state.options.automation.prioWonders
        } else {
          newOptions.pages[key].options = state.options[key]

          if (key === CONSTANTS.PAGES.POPULATION) {
            newOptions.pages[key].options.minimumFood = state.options.automation.minimumFood
            newOptions.pages[key].options.populationRebalanceTime = state.options.automation.populationRebalanceTime
          }
        }
      })

      const selectedAncestor = Object.keys(state.options.automation).find((key) => key.includes('selected_ancestor_') && state.options.automation[key])
      newOptions.ancestor.enabled = state.options.automation.ancestor
      newOptions.ancestor.selected = selectedAncestor ? selectedAncestor.replace('selected_', '') : ''
      newOptions.prestige.enabled = state.options.automation.prestige

      state.options = newOptions
      localStorage.set('options', state.options)
    }
  },
  () => {
    state.lastVisited = {}
    localStorage.set('lastVisited', state.lastVisited)
  },
]

const runMigrations = () => {
  const lastMigration = state.options.lastMigration || 0
  let migrationsRan = false

  for (let i = lastMigration; i < migrations.length; i++) {
    migrations[i]()
    migrationsRan = true
  }
  state.options.lastMigration = migrations.length
  localStorage.set('options', state.options)

  if (migrationsRan) {
    window.location.reload()
  }
}

export default runMigrations
