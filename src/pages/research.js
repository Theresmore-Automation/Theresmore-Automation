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
          confirm: false,
        }

        const researchData = tech.find((technology) => technology.id === key)
        if (researchData) {
          research.confirm = researchData.confirm
        }

        return research
      })

    return allowedResearch
  }

  return []
}

export default {
  id: CONSTANTS.PAGES.RESEARCH,
  enabled: () => userEnabled() && navigation.hasPage(CONSTANTS.PAGES.RESEARCH) && getAllowedResearch().length,
  action: async () => {
    await navigation.switchSubPage(CONSTANTS.SUBPAGES.RESEARCH, CONSTANTS.PAGES.RESEARCH)

    const allowedResearch = getAllowedResearch()

    let buttonsList = selectors
      .getAllButtons(true)
      .filter((button) => !!allowedResearch.find((tech) => tech.id === button.innerText.split('\n').shift().trim()))

    if (buttonsList.length) {
      while (!state.scriptPaused && buttonsList.length) {
        const button = buttonsList.shift()

        button.click()
        logger({ msgLevel: 'log', msg: `Researching ${button.innerText.split('\n').shift()}` })

        if (allowedResearch.find((tech) => tech.id === button.innerText.split('\n').shift().trim()).confirm) {
          await sleep(1000)
          const redConfirmButton = [...document.querySelectorAll('.btn.btn-red')].find((button) => button.innerText.includes('Confirm'))

          if (redConfirmButton) {
            redConfirmButton.click()
            await sleep(2000)
          }
        }

        await sleep(6000)

        buttonsList = selectors
          .getAllButtons(true)
          .filter((button) => !!allowedResearch.find((tech) => tech.id === button.innerText.split('\n').shift().trim()))
      }
    }

    await sleep(5000)
  },
}
