import { CONSTANTS, navigation, logger, sleep, state, resources, selectors, translate } from '../utils'

const userEnabled = () => {
  return (
    (state.options.pages[CONSTANTS.PAGES.ARMY].enabled || false) &&
    (state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].enabled || false)
  )
}

const userSelectedUnits = () => {
  return (
    state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.scoutsMax ||
    state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.explorersMax
  )
}

const getSendToExplore = (container) => {
  return container.querySelector('button.btn-blue:not(.btn-off)')
}

const executeAction = async () => {
  if (!navigation.checkPage(CONSTANTS.PAGES.ARMY, CONSTANTS.SUBPAGES.EXPLORE)) return
  if (state.scriptPaused) return

  const maxScouts = state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.scoutsMax
  const minScouts = state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.scoutsMin
  const maxExplorers = state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.explorersMax
  const minExplorers = state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.explorersMin

  const container = document.querySelector('div.tab-container.sub-container')

  if (container) {
    let canExplore = false
    const boxes = [...container.querySelectorAll('div.grid > div.flex')]
    boxes.shift()
    let unitsSent = []

    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i]
      const name = box.querySelector('h5.font-bold').innerText.trim()
      const removeUnitButton = box.querySelector('div.inline-flex button.btn-red.rounded-none')
      const addUnitButton = box.querySelector('div.inline-flex button.btn-green.rounded-none')
      let count = box
        .querySelector('input[type="text"]')
        .value.split(' / ')
        .map((x) => +x)

      const limitMax = name === 'Scout' ? maxScouts : maxExplorers
      const limitMin = name === 'Scout' ? minScouts : minExplorers

      if (count[1] < limitMin) {
        break
      }

      for (let i = 0; i < count[0] - limitMax && removeUnitButton && !removeUnitButton.disabled; i++) {
        removeUnitButton.click()
        await sleep(25)
      }

      count = box
        .querySelector('input[type="text"]')
        .value.split(' / ')
        .map((x) => +x)

      for (let i = 0; i < limitMax - count[0] && addUnitButton && !addUnitButton.disabled && !!getSendToExplore(container); i++) {
        addUnitButton.click()
        await sleep(25)
      }

      if (!getSendToExplore(container)) {
        const removeUnitButton = box.querySelector('div.inline-flex button.btn-red.rounded-none')
        removeUnitButton.click()
        await sleep(25)
      }

      count = box
        .querySelector('input[type="text"]')
        .value.split(' / ')
        .map((x) => +x)

      if (count[0] >= limitMin) {
        canExplore = true
        if (name === 'Scout') {
          unitsSent.push(`${count[0]} Scout(s)`)
        } else {
          unitsSent.push(`${count[0]} Explorer(s)`)
        }
      } else {
        const removeUnitButton = box.querySelector('div.inline-flex button.btn-red.rounded-none')
        while (removeUnitButton && !removeUnitButton.disabled) {
          removeUnitButton.click()
          await sleep(25)
        }
      }
    }

    const sendToExplore = getSendToExplore(container)
    if (!state.scriptPaused && sendToExplore && canExplore) {
      logger({ msgLevel: 'log', msg: `Starting exploration: ${unitsSent.join(', ')}` })
      sendToExplore.click()
      await sleep(25)
    }
  }
}

export default {
  page: CONSTANTS.PAGES.ARMY,
  subpage: CONSTANTS.SUBPAGES.EXPLORE,
  enabled: () =>
    userEnabled() &&
    navigation.hasPage(CONSTANTS.PAGES.ARMY) &&
    userSelectedUnits() &&
    new Date().getTime() - (state.lastVisited[`${CONSTANTS.PAGES.ARMY}${CONSTANTS.SUBPAGES.EXPLORE}`] || 0) > 35 * 1000,
  action: async () => {
    await navigation.switchSubPage(CONSTANTS.SUBPAGES.EXPLORE, CONSTANTS.PAGES.ARMY)

    if (navigation.checkPage(CONSTANTS.PAGES.ARMY, CONSTANTS.SUBPAGES.EXPLORE)) await executeAction()
  },
}
