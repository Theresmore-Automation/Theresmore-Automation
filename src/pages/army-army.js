import { CONSTANTS, navigation, logger, sleep, state, resources } from '../utils'

const timeToWaitUntilFullResource = 60

const hasBA = () => {
  const leg = window.localStorage.getItem('leg')

  if (leg) {
    return !!JSON.parse(leg).find((legacy) => legacy.id === 'angel')
  }

  return false
}

const canAffordBA = () => {
  const faith = resources.get('Faith')
  const mana = resources.get('Mana')

  if (faith && mana) {
    if (faith.current >= 2000 && mana.current >= 600) {
      return true
    }
  }

  return false
}

const shouldBuyBA = () => {
  const faith = resources.get('Faith')
  const mana = resources.get('Mana')

  if (faith && mana) {
    if (
      faith.current + faith.speed * timeToWaitUntilFullResource >= faith.max &&
      mana.current + mana.speed * timeToWaitUntilFullResource >= mana.max &&
      mana.speed > 20
    ) {
      return true
    }
  }

  return false
}

const userEnabled = () => {
  return (
    (state.options.pages[CONSTANTS.PAGES.ARMY].enabled || false) &&
    (state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.ARMY].enabled || false)
  )
}

const executeAction = async () => {
  if (hasBA() && canAffordBA() && shouldBuyBA()) {
    const allButtons = [...document.querySelectorAll('div > div > div > div > div > span > button:not(.btn-off)')]
    const buyBAButton = allButtons.find((button) => button.innerText.includes('Battle Angel'))

    if (buyBAButton) {
      buyBAButton.click()
      logger({ msgLevel: 'log', msg: `Buying Battle Angel(s)` })
      await sleep(4000)
      if (!navigation.checkPage(CONSTANTS.PAGES.ARMY, CONSTANTS.SUBPAGES.ARMY)) return
    }
  }
}

export default {
  page: CONSTANTS.PAGES.ARMY,
  subpage: CONSTANTS.SUBPAGES.ARMY,
  enabled: () =>
    userEnabled() &&
    navigation.hasPage(CONSTANTS.PAGES.ARMY) &&
    hasBA() &&
    canAffordBA() &&
    shouldBuyBA() &&
    state.lastVisited[CONSTANTS.PAGES.ARMY] + 2 * 60 * 1000 < new Date().getTime(),
  action: async () => {
    await navigation.switchSubPage(CONSTANTS.SUBPAGES.ARMY, CONSTANTS.PAGES.ARMY)

    if (navigation.checkPage(CONSTANTS.PAGES.ARMY, CONSTANTS.SUBPAGES.ARMY)) await executeAction()
  },
}
