import { factions, locations, units } from '../data'
import { CONSTANTS, navigation, logger, sleep, state, resources, selectors, translate, reactUtil, keyGen } from '../utils'

const userEnabled = () => {
  return (
    (state.options.pages[CONSTANTS.PAGES.ARMY].enabled || false) &&
    (state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].enabled || false)
  )
}

const getSendToExplore = (container, activeOnly = true) => {
  const activeOnlySelector = activeOnly ? ':not(.btn-off):not(.btn-off-cap)' : ''
  return container.querySelector(`button.btn-blue${activeOnlySelector}`)
}

const executeAction = async () => {
  if (!navigation.checkPage(CONSTANTS.PAGES.ARMY, CONSTANTS.SUBPAGES.EXPLORE)) return
  if (state.scriptPaused) return

  const limits = {
    scout: {
      min: state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.scoutsMin ?? 0,
      max: state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.scoutsMax ?? 0,
    },
    explorer: {
      min: state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.explorersMin ?? 0,
      max: state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.explorersMax ?? 0,
    },
    familiar: {
      min: state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.familiarsMin ?? 0,
      max: state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.EXPLORE].options.familiarsMax ?? 0,
    },
  }

  const container = document.querySelector('div.tab-container.sub-container')

  if (container) {
    let canExplore = false
    const boxes = [...container.querySelectorAll('div.grid > div.flex')]
    boxes.shift()
    let unitsSent = []

    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i]
      const unitKey = reactUtil.getNearestKey(box, 2)
      const removeUnitButton = box.querySelector('div.inline-flex button.btn-red.rounded-none')
      const addUnitButton = box.querySelector('div.inline-flex button.btn-green.rounded-none')
      const unit = units.find((unit) => keyGen.armyAttack.key(unit.id) === unitKey)
      let count = box
        .querySelector('input[type="text"]')
        .value.split(' / ')
        .map((x) => +x)

      if (!limits[unit.id]) {
        continue
      }

      const limitMin = limits[unit.id].min
      const limitMax = limits[unit.id].max

      if (count[1] < limitMin) {
        continue
      }

      for (let i = 0; i < count[0] - limitMax && removeUnitButton && !removeUnitButton.disabled; i++) {
        removeUnitButton.click()
        await sleep(25)
      }

      count = box
        .querySelector('input[type="text"]')
        .value.split(' / ')
        .map((x) => +x)

      for (let i = 0; i < limitMax - count[0] && addUnitButton && !addUnitButton.disabled && !!getSendToExplore(container, false); i++) {
        addUnitButton.click()
        await sleep(25)
      }

      if (!getSendToExplore(container)) {
        const removeUnitButton = box.querySelector('div.inline-flex button.btn-red.rounded-none')

        if (removeUnitButton && !removeUnitButton.disabled) {
          removeUnitButton.click()
          await sleep(25)
        }
      }

      count = box
        .querySelector('input[type="text"]')
        .value.split(' / ')
        .map((x) => +x)

      if (count[0] >= limitMin) {
        canExplore = true

        unitsSent.push(`${count[0]} ${translate(unit.id, 'uni_')}(s)`)
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

const getMinWaitTime = () => {
  let waitTime = 60000

  if (reactUtil.getGameData().StatsStore && reactUtil.getGameData().StatsStore.ngResetNumber) {
    const ngResets = reactUtil.getGameData().StatsStore.ngResetNumber

    for (let i = 0; i < ngResets; i++) {
      waitTime = waitTime / 2
    }
  }

  waitTime = Math.ceil(Math.max(waitTime, 3000) / 2) + 1000

  return waitTime
}

export default {
  page: CONSTANTS.PAGES.ARMY,
  subpage: CONSTANTS.SUBPAGES.EXPLORE,
  enabled: () =>
    userEnabled() &&
    navigation.hasPage(CONSTANTS.PAGES.ARMY) &&
    new Date().getTime() - (state.lastVisited[`${CONSTANTS.PAGES.ARMY}${CONSTANTS.SUBPAGES.EXPLORE}`] || 0) > getMinWaitTime(),
  action: async () => {
    await navigation.switchSubPage(CONSTANTS.SUBPAGES.EXPLORE, CONSTANTS.PAGES.ARMY)

    if (navigation.checkPage(CONSTANTS.PAGES.ARMY, CONSTANTS.SUBPAGES.EXPLORE)) await executeAction()
  },
}
