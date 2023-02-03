import { CONSTANTS, navigation, logger, sleep, state, resources } from '../utils'

const timeToWaitUntilFullResource = 60

const userEnabled = () => {
  return state.options.subpages[CONSTANTS.SUBPAGES.PRAYERS] || false
}

const doPrayersWork = async () => {
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
  id: CONSTANTS.PAGES.ARMY,
  enabled: () =>
    userEnabled() && navigation.hasPage(CONSTANTS.PAGES.MAGIC) && state.lastVisited[CONSTANTS.SUBPAGES.PRAYERS] + 2 * 60 * 1000 < new Date().getTime(),
  action: async () => {
    await navigation.switchSubPage(CONSTANTS.SUBPAGES.PRAYERS, CONSTANTS.PAGES.MAGIC)

    if (navigation.checkPage(CONSTANTS.PAGES.MAGIC, CONSTANTS.SUBPAGES.PRAYERS)) await doPrayersWork()
  },
}
