import { spells } from '../data'
import { CONSTANTS, navigation, selectors, logger, sleep, state, translate } from '../utils'

const userEnabled = () => {
  return (
    (state.options.pages[CONSTANTS.PAGES.MAGIC].enabled || false) &&
    (state.options.pages[CONSTANTS.PAGES.MAGIC].subpages[CONSTANTS.SUBPAGES.PRAYERS].enabled || false)
  )
}

const getAllowedPrayers = () => {
  const prayersOptions = state.options.pages[CONSTANTS.PAGES.MAGIC].subpages[CONSTANTS.SUBPAGES.PRAYERS].options

  if (Object.keys(prayersOptions).length) {
    let allowedPrayers = Object.keys(prayersOptions)
      .filter((key) => !!prayersOptions[key])
      .map((key) => {
        const prayer = {
          key: key,
          id: translate(key, 'fai_'),
          prio: prayersOptions[key],
        }

        const prayerData = spells.find((spell) => spell.id === key)

        return { ...prayerData, ...prayer }
      })

    return allowedPrayers
  }

  return []
}

const getAllButtons = () => {
  const buttonsList = selectors.getAllButtons(true)

  const allowedPrayers = getAllowedPrayers()
    .map((prayer) => {
      const button = buttonsList.find((button) => button.innerText.split('\n').shift().trim() === prayer.id)

      return { ...prayer, button }
    })
    .filter((prayer) => prayer.button)
    .sort((a, b) => b.prio - a.prio)

  return allowedPrayers
}

const executeAction = async () => {
  let buttonsList = getAllButtons()

  if (buttonsList.length) {
    while (!state.scriptPaused && buttonsList.length) {
      const highestPrio = buttonsList[0].prio
      buttonsList = buttonsList.filter((prayer) => prayer.prio === highestPrio)

      for (let i = 0; i < buttonsList.length; i++) {
        const prayer = buttonsList[i]

        prayer.button.click()
        logger({ msgLevel: 'log', msg: `Researching prayer ${prayer.id}` })
        await sleep(25)

        if (!navigation.checkPage(CONSTANTS.PAGES.MAGIC, CONSTANTS.SUBPAGES.PRAYERS)) return
      }

      await sleep(3100)
      buttonsList = getAllButtons()
    }
  }
}

export default {
  page: CONSTANTS.PAGES.MAGIC,
  subpage: CONSTANTS.SUBPAGES.PRAYERS,
  enabled: () => userEnabled() && navigation.hasPage(CONSTANTS.PAGES.MAGIC) && getAllowedPrayers().length,
  action: async () => {
    await navigation.switchSubPage(CONSTANTS.SUBPAGES.PRAYERS, CONSTANTS.PAGES.MAGIC)

    if (navigation.checkPage(CONSTANTS.PAGES.MAGIC, CONSTANTS.SUBPAGES.PRAYERS)) await executeAction()
  },
}
