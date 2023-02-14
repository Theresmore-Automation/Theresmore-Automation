import { buildings } from '../data'
import { CONSTANTS, navigation, selectors, logger, resources, sleep, state, numberParser, translate } from '../utils'

const getBuildingsList = () => {
  const buildingsObject = state.options.pages[CONSTANTS.PAGES.BUILD].subpages[CONSTANTS.SUBPAGES.COLONY].options

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
                return { resource: translate(gen.id, 'res_'), parameter: 'speed', minValue: Math.abs(gen.value) }
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
  return (
    (state.options.pages[CONSTANTS.PAGES.BUILD].enabled || false) &&
    (state.options.pages[CONSTANTS.PAGES.BUILD].subpages[CONSTANTS.SUBPAGES.COLONY].enabled || false)
  )
}

const getAllButtons = () => {
  const buildingsList = getBuildingsList()

  const buttons = selectors
    .getAllButtons(true)
    .map((button) => {
      const id = button.innerText.split('\n').shift()
      const count = button.querySelector('span') ? numberParser.parse(button.querySelector('span').innerText) : 0
      return { id: id, element: button, count: count, building: buildingsList.find((building) => building.id === id) }
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
        }

        if (shouldBuild) {
          button.element.click()
          logger({ msgLevel: 'log', msg: `Building ${button.building.id}` })
          refreshButtons = true
          await sleep(25)
          if (!navigation.checkPage(CONSTANTS.PAGES.BUILD, CONSTANTS.SUBPAGES.COLONY)) return
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
      const id = button.innerText.split('\n').shift()
      let count = button.querySelector('span') ? numberParser.parse(button.querySelector('span').innerText) : 0
      const building = buildingsList.find((building) => building.id === id)

      if (!building) {
        return {}
      }

      if (button.className.includes('btn-cap') && building.cap) {
        count = building.cap
      }

      return { id: id, count: count, canBuild: !button.className.includes('btn-off'), ...building }
    })
    .filter((building) => building.id)
}

export default {
  page: CONSTANTS.PAGES.BUILD,
  subpage: CONSTANTS.SUBPAGES.COLONY,
  enabled: () => userEnabled() && navigation.hasPage(CONSTANTS.PAGES.BUILD) && getBuildingsList().length,
  action: async () => {
    await navigation.switchSubPage(CONSTANTS.SUBPAGES.COLONY, CONSTANTS.PAGES.BUILD)

    if (navigation.checkPage(CONSTANTS.PAGES.BUILD, CONSTANTS.SUBPAGES.COLONY)) await executeAction()
  },
}
