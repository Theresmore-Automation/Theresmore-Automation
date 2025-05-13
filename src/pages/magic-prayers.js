import { spells } from '../data'
import { CONSTANTS, navigation, selectors, logger, sleep, state, translate, resources, reactUtil, keyGen } from '../utils'

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
  const buttonsList = selectors.getAllButtons(true, ':not(.btn-progress)')

  const allowedPrayers = getAllowedPrayers()
    .map((prayer) => {
      const button = buttonsList.find((button) => reactUtil.getNearestKey(button, 6) === keyGen.magic.key(prayer.key))

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

        if (state.options.turbo.enabled && state.MainStore) {
          state.MainStore.MagicStore.addPrayer(prayer.key)
        } else {
          prayer.button.click()
        }

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
  enabled: () =>
    userEnabled() && navigation.hasPage(CONSTANTS.PAGES.MAGIC) && getAllowedPrayers().length && resources.get('faith') && resources.get('faith').max,
  action: async () => {
    await navigation.switchSubPage(CONSTANTS.SUBPAGES.PRAYERS, CONSTANTS.PAGES.MAGIC)

    if (navigation.checkPage(CONSTANTS.PAGES.MAGIC, CONSTANTS.SUBPAGES.PRAYERS)) await executeAction()
  },
}
