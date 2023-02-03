import { tech } from '../data'
import { CONSTANTS, navigation, selectors, logger, sleep, state, translate } from '../utils'

const userEnabled = () => {
  return state.options.pages[CONSTANTS.PAGES.RESEARCH] || false
}

const getAllowedResearch = () => {
  if (Object.keys(state.options[CONSTANTS.PAGES.RESEARCH]).length) {
    let allowedResearch = Object.keys(state.options[CONSTANTS.PAGES.RESEARCH])
      .filter((key) => !!state.options[CONSTANTS.PAGES.RESEARCH][key])
      .map((key) => {
        const research = {
          key: key,
          id: translate(key, 'tec_'),
          prio: state.options[CONSTANTS.PAGES.RESEARCH][key],
        }

        const researchData = tech.find((technology) => technology.id === key)

        return { ...researchData, ...research }
      })

    return allowedResearch
  }

  return []
}

const getAllButtons = () => {
  const allowedResearch = getAllowedResearch()

  const buttonsList = selectors
    .getAllButtons(true)
    .filter((button) => !!allowedResearch.find((tech) => tech.id === button.innerText.split('\n').shift().trim()))
    .sort((a, b) => {
      return (
        allowedResearch.find((tech) => tech.id === b.innerText.split('\n').shift().trim()).prio -
        allowedResearch.find((tech) => tech.id === a.innerText.split('\n').shift().trim()).prio
      )
    })

  return buttonsList
}

const doResearchWork = async () => {
  const allowedResearch = getAllowedResearch()

  let buttonsList = getAllButtons()

  if (buttonsList.length) {
    while (!state.scriptPaused && buttonsList.length) {
      const button = buttonsList.shift()

      button.click()
      logger({ msgLevel: 'log', msg: `Researching ${button.innerText.split('\n').shift()}` })

      if (allowedResearch.find((tech) => tech.id === button.innerText.split('\n').shift().trim()).confirm) {
        await sleep(1000)
        if (!navigation.checkPage(CONSTANTS.PAGES.RESEARCH, CONSTANTS.SUBPAGES.RESEARCH)) return
        const redConfirmButton = [...document.querySelectorAll('.btn.btn-red')].find((button) => button.innerText.includes('Confirm'))

        if (redConfirmButton) {
          redConfirmButton.click()
          await sleep(4000)
          if (!navigation.checkPage(CONSTANTS.PAGES.RESEARCH, CONSTANTS.SUBPAGES.RESEARCH)) return
        }
      }

      await sleep(4000)
      if (!navigation.checkPage(CONSTANTS.PAGES.RESEARCH, CONSTANTS.SUBPAGES.RESEARCH)) return

      buttonsList = getAllButtons()
    }
  }
}

export default {
  id: CONSTANTS.PAGES.RESEARCH,
  enabled: () => userEnabled() && navigation.hasPage(CONSTANTS.PAGES.RESEARCH) && getAllowedResearch().length,
  action: async () => {
    await navigation.switchSubPage(CONSTANTS.SUBPAGES.RESEARCH, CONSTANTS.PAGES.RESEARCH)

    if (navigation.checkPage(CONSTANTS.PAGES.RESEARCH, CONSTANTS.SUBPAGES.RESEARCH)) await doResearchWork()
  },
}
