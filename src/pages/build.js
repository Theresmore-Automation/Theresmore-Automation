import { CONSTANTS, navigation, selectors, logger, resources, sleep, state, numberParser } from '../utils'

const buildingsList = [
  { id: 'Mausoleum of gods', alwaysBuild: true, isSafe: true },
  { id: 'Tower of mana', alwaysBuild: true, isSafe: true },
  { id: 'City of Lights', alwaysBuild: true, isSafe: true },
  { id: 'Harbor district', alwaysBuild: true, isSafe: true },
  { id: 'Stock exchange', alwaysBuild: true, isSafe: true },
  { id: 'Mana pit', alwaysBuild: true, isSafe: true },
  { id: 'Great bombard', alwaysBuild: true, isSafe: true },
  { id: 'Refugees district', alwaysBuild: true, isSafe: true },
  { id: 'Academy of Freethinkers', alwaysBuild: true, isSafe: true },
  { id: 'City center', alwaysBuild: true, isSafe: true },
  { id: 'Cathedral', alwaysBuild: true, isSafe: true },
  { id: 'Great fair', alwaysBuild: true, isSafe: true },
  { id: 'Palisade', alwaysBuild: true, isSafe: true },
  { id: 'Wall', alwaysBuild: true, isSafe: true },
  { id: 'Tower of mana part', alwaysBuild: true, isSafe: true },
  { id: 'City of Lights part', alwaysBuild: true, isSafe: true },
  { id: 'Harbor district part', alwaysBuild: true, isSafe: true },
  { id: 'Stock exchange part', alwaysBuild: true, isSafe: true },
  { id: 'Mana pit part', alwaysBuild: true, isSafe: true },
  { id: 'Great bombard part', alwaysBuild: true, isSafe: true },
  { id: 'Refugees district part', alwaysBuild: true, isSafe: true },
  { id: 'A. of Freethinkers Part', alwaysBuild: true, isSafe: true },
  { id: 'City center part', alwaysBuild: true, isSafe: true },
  { id: 'Great fair unit', alwaysBuild: true, isSafe: true },
  { id: 'Cathedral part', alwaysBuild: true, isSafe: true },
  { id: 'Guild of craftsmen', alwaysBuild: true, isSafe: true },
  { id: 'Machines of gods', alwaysBuild: true, isSafe: true },
  { id: 'Library of Theresmore', alwaysBuild: true, isSafe: true },
  { id: 'Monastery', alwaysBuild: true, isSafe: true },
  { id: 'Watchman Outpost', alwaysBuild: true, isSafe: true },
  { id: 'Hall of the dead', alwaysBuild: true, isSafe: true },
  { id: 'Sawmill', alwaysBuild: true, isSafe: true },
  { id: 'Monument', alwaysBuild: true, isSafe: true },
  { id: 'Foundry', alwaysBuild: true, isSafe: true },
  { id: 'Builder district', alwaysBuild: true, isSafe: true },
  { id: 'Gan Eden', alwaysBuild: true, isSafe: true },
  { id: 'Portal of the dead', alwaysBuild: true, isSafe: true },
  { id: 'Library of SouLs', alwaysBuild: true, isSafe: true },
  { id: 'Souls', isSafe: true },
  { id: 'Books', isSafe: true },
  { id: 'Observatory', isSafe: true },
  { id: 'The Vaults', isSafe: true },
  { id: 'Credit union', isSafe: true },
  { id: 'Canava trading post', isSafe: true },
  { id: 'Bank', isSafe: true },
  { id: 'Marketplace', isSafe: true },
  { id: 'Artisan Workshop', isSafe: true },
  { id: 'Granary', isSafe: true },
  { id: 'Hall of wisdom', isSafe: true },
  { id: 'School', isSafe: true },
  { id: 'University', isSafe: true },
  { id: 'Research plant', isSafe: true },
  { id: 'Undead Herds', isSafe: true },
  { id: 'Guarded warehouse', isSafe: true },
  { id: 'Fiefdom', isSafe: true },
  { id: 'Natronite refinery', isSafe: true },
  { id: 'Alchemical laboratory', isSafe: true },
  { id: 'Lumberjack Camp', isSafe: true },
  { id: 'Quarry', isSafe: true },
  { id: 'Mine', isSafe: true },
  { id: 'Palisade part', isSafe: true },
  { id: 'Wall part', isSafe: true },
  { id: 'Rampart', alwaysBuild: true, isSafe: true },
  { id: 'Rampart part', isSafe: true },
  { id: 'Farm', isSafe: true },
  { id: 'Matter transmuter', isSafe: true },
  { id: 'Stable', isSafe: true },
  { id: 'Spiritual garden', isSafe: true },
  { id: 'Conclave', isSafe: true },
  { id: 'Magical tower', isSafe: true },
  { id: 'Temple', isSafe: true },
  { id: 'Altar of sacrifices', isSafe: true },
  { id: 'Fountain of Prosperity', isSafe: true },
  { id: 'Valley of plenty', isSafe: true },
  { id: 'Tax revenue checkpoints', isSafe: true },
  { id: 'Industrial plant', isSafe: true },
  { id: 'Magic Circle', isSafe: true },
  { id: 'Carpenter workshop', isSafe: true },
  { id: 'Grocery', isSafe: true },
  { id: 'Steelworks', isSafe: true },
  { id: 'Military academy', isSafe: true },
  { id: 'Ancient vault', isSafe: true },
  { id: 'Recruit training center', isSafe: true },
  { id: 'Officer training ground', isSafe: true },
  { id: 'Castrum Militia', isSafe: true },
  { id: 'Mansion', isSafe: false, requires: { resource: 'Food', parameter: 'speed', minValue: 3 } },
  { id: 'City Hall', isSafe: false, requires: { resource: 'Food', parameter: 'speed', minValue: 1.5 } },
  { id: 'Residential block', isSafe: false, requires: { resource: 'Food', parameter: 'speed', minValue: 5 } },
  { id: 'Common House', isSafe: false, requires: { resource: 'Food', parameter: 'speed', minValue: 1 } },
  { id: 'Storage facility', isSafe: true },
  { id: 'Ballista', isSafe: true },
  { id: 'Large warehouse', isSafe: true },
  { id: 'Large storehouse', isSafe: true },
  { id: 'Store', isSafe: true },
  { id: 'Natronite depot', isSafe: true },
  { id: 'Barracks', isSafe: true },
  { id: 'Minefield', isSafe: true },
  { id: 'Natronite balloon', isSafe: true },
  { id: 'Decryption of the portal', isSafe: true },
  { id: 'Fortune grove', isSafe: true },
  { id: 'Pillars of mana', isSafe: false, requires: { resource: 'Gold', parameter: 'speed', minValue: 100 } },
]
  .filter((building) => building.id)
  .map((building, index) => {
    return {
      ...building,
      order: index,
    }
  })

export default {
  id: CONSTANTS.PAGES.BUILD,
  enabled: () => navigation.hasPage(CONSTANTS.PAGES.BUILD) && state.lastVisited[CONSTANTS.PAGES.BUILD] < state.lastVisited[CONSTANTS.PAGES.RESEARCH],
  action: async () => {
    await navigation.switchPage(CONSTANTS.PAGES.BUILD)

    let buttons = selectors
      .getAllButtons(true)
      .map((button) => {
        const id = button.innerText.split('\n').shift()
        return { id: id, element: button, building: buildingsList.find((building) => building.id === id) }
      })
      .filter((button) => button.building)
      .sort((a, b) => a.building.order - b.building.order)

    if (buttons.length) {
      while (!state.scriptPaused && buttons.length) {
        let shouldBuild = true
        const button = buttons.shift()

        if (!button.building.isSafe) {
          const requiredResource = resources.get(button.building.requires.resource)
          if (!requiredResource) {
            shouldBuild = false
          } else {
            if (
              button.id === 'Common House' &&
              (!button.element.querySelector('span') || numberParser.parse(button.element.querySelector('span').innerText) < 2)
            ) {
              shouldBuild = true
            } else {
              shouldBuild = shouldBuild && requiredResource[button.building.requires.parameter] > button.building.requires.minValue
            }
          }
        }

        if (shouldBuild) {
          button.element.click()
          logger({ msgLevel: 'log', msg: `Building ${button.building.id}` })
          await sleep(6000)

          buttons = selectors
            .getAllButtons(true)
            .map((button) => {
              const id = button.innerText.split('\n').shift()
              return { id: id, element: button, building: buildingsList.find((building) => building.id === id) }
            })
            .filter((button) => button.building)
            .sort((a, b) => a.building.order - b.building.order)
        }
      }
    }

    await sleep(5000)
  },
}
