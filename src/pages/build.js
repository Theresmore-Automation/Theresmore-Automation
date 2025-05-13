import { buildings } from '../data'
import { CONSTANTS, navigation, selectors, logger, resources, sleep, state, numberParser, translate, reactUtil, keyGen } from '../utils'

export const getBuildSubpage = (subpage) => {
  const getBuildingsList = () => {
    const buildingsObject = state.options.pages[CONSTANTS.PAGES.BUILD].subpages[subpage].options

    if (Object.keys(buildingsObject).length) {
      let buildingsList = Object.keys(buildingsObject)
        .filter((key) => !key.includes('prio_'))
        .filter((key) => !!buildingsObject[key])
        .filter((key) => !!buildingsObject[`prio_${key}`])
        .map((key) => {
          const building = {
            key: key,
            id: translate(key, 'bui_'),
            max: buildingsObject[key] === -1 ? 999 : buildingsObject[key],
            prio: buildingsObject[`prio_${key}`],
            isSafe: true,
          }

          const buildingData = buildings.find((building) => building.id === key)
          if (buildingData) {
            if (buildingData.gen) {
              const negativeGen = buildingData.gen.filter((gen) => gen.value < 0 && gen.type === 'resource')
              building.isSafe = !negativeGen.length

              if (negativeGen.length) {
                const requires = negativeGen.map((gen) => {
                  return { resource: gen.id, parameter: 'speed', minValue: Math.abs(gen.value) }
                })

                building.requires = requires
              }
            }
          }

          return { ...buildingData, ...building }
        })
        .sort((a, b) => {
          return b.prio - a.prio
        })

      return buildingsList
    }

    return []
  }

  const userEnabled = () => {
    return (state.options.pages[CONSTANTS.PAGES.BUILD].enabled || false) && (state.options.pages[CONSTANTS.PAGES.BUILD].subpages[subpage].enabled || false)
  }

  const getAllButtons = () => {
    const buildingsList = getBuildingsList()

    const buttons = selectors
      .getAllButtons(true)
      .map((button) => {
        const id = reactUtil.getNearestKey(button, 6)
        const count = button.querySelector('span.right-0') ? numberParser.parse(button.querySelector('span.right-0').innerText) : 0
        return { id: id, element: button, count: count, building: buildingsList.find((building) => keyGen.building.key(building.key) === id) }
      })
      .filter((button) => button.building && button.count < button.building.max)
      .sort((a, b) => {
        if (a.building.prio !== b.building.prio) {
          return b.building.prio - a.building.prio
        }

        return a.count - b.count
      })

    return buttons
  }

  const executeAction = async () => {
    let buttons = getAllButtons()

    if (buttons.length) {
      while (!state.scriptPaused && buttons.length) {
        let refreshButtons = false
        const highestPrio = buttons[0].building.prio
        const highestPrioBuildings = buttons.filter((button) => button.building.prio === highestPrio)
        buttons = buttons.filter((button) => button.building.prio < highestPrio)

        while (!state.scriptPaused && highestPrioBuildings.length) {
          let shouldBuild = true
          const button = highestPrioBuildings.shift()

          if (!button.building.isSafe && button.building.requires.length) {
            shouldBuild = !button.building.requires.find((req) => !resources.get(req.resource) || resources.get(req.resource)[req.parameter] <= req.minValue)

            if (button.building.key === 'common_house' && !button.count) {
              shouldBuild = true
            }
          }

          if (shouldBuild) {
            if (state.options.turbo.enabled && state.MainStore) {
              state.MainStore.BuildingsStore.addBuilding(button.building.key)
            } else {
              button.element.click()
            }

            logger({ msgLevel: 'log', msg: `Building ${button.building.id}` })
            refreshButtons = true
            await sleep(25)
            if (!navigation.checkPage(CONSTANTS.PAGES.BUILD)) return
          }
        }
        await sleep(1400)

        if (refreshButtons) {
          buttons = getAllButtons()
        }
      }
    }

    const buildingsList = getBuildingsList()
    state.buildings = selectors
      .getAllButtons(false)
      .map((button) => {
        const id = reactUtil.getNearestKey(button, 6)
        let count = reactUtil.getGameData().idxs.buildings[id] ? reactUtil.getGameData().idxs.buildings[id] : 0
        const building = buildingsList.find((building) => keyGen.building.key(building.key) === id)

        if (!building) {
          return {}
        }

        if (button.className.includes('btn-cap') && building.cap) {
          count = building.cap
        }

        return { id: id, count: count, canBuild: !button.classList.toString().includes('btn-off'), ...building }
      })
      .filter((building) => building.id)
  }

  return {
    page: CONSTANTS.PAGES.BUILD,
    subpage: subpage,
    enabled: () => userEnabled() && navigation.hasPage(CONSTANTS.PAGES.BUILD) && getBuildingsList().length,
    action: async () => {
      await navigation.switchSubPage(subpage, CONSTANTS.PAGES.BUILD)

      if (navigation.checkPage(CONSTANTS.PAGES.BUILD)) await executeAction()
    },
  }
}
