import { tech } from '../data'
import { CONSTANTS, navigation, selectors, logger, sleep, state, translate } from '../utils'

const userEnabled = () => {
  return state.options.pages[CONSTANTS.PAGES.RESEARCH].subpages[CONSTANTS.SUBPAGES.RESEARCH].enabled || false
}

const getAllowedResearch = () => {
  const researchOptions = state.options.pages[CONSTANTS.PAGES.RESEARCH].subpages[CONSTANTS.SUBPAGES.RESEARCH].options

  if (Object.keys(researchOptions).length) {
    let allowedResearch = Object.keys(researchOptions)
      .filter((key) => !!researchOptions[key])
      .map((key) => {
        const research = {
          key: key,
          id: translate(key, 'tec_'),
          prio: researchOptions[key],
        }

        const researchData = tech.find((technology) => technology.id === key)

        return { ...researchData, ...research }
      })

    return allowedResearch
  }

  return []
}

const getAllButtons = () => {
  const buttonsList = selectors.getAllButtons(true)

  const allowedResearch = getAllowedResearch()
    .map((tech) => {
      let button = buttonsList.find((button) => button.innerText.split('\n').shift().trim() === tech.id)

      if (!button && tech.id === 'A moonlit night') {
        button = buttonsList.find((button) => button.innerText.split('\n').shift().trim() === 'A moonlight night')
      }

      return { ...tech, button }
    })
    .filter((tech) => tech.button)
    .sort((a, b) => b.prio - a.prio)

  return allowedResearch
}

const executeAction = async () => {
  let buttonsList = getAllButtons()

  if (buttonsList.length) {
    while (!state.scriptPaused && buttonsList.length) {
      const highestPrio = buttonsList[0].prio
      buttonsList = buttonsList.filter((tech) => tech.prio === highestPrio)

      for (let i = 0; i < buttonsList.length; i++) {
        const research = buttonsList[i]

        research.button.click()
        logger({ msgLevel: 'log', msg: `Researching ${research.id}` })
        await sleep(25)

        if (research.confirm) {
          if (!navigation.checkPage(CONSTANTS.PAGES.RESEARCH, CONSTANTS.SUBPAGES.RESEARCH)) return
          await sleep(1000)
          const redConfirmButton = [...document.querySelectorAll('.btn.btn-red')].find((button) => button.innerText.includes('Confirm'))

          if (redConfirmButton) {
            redConfirmButton.click()
            await sleep(4000)
            if (!navigation.checkPage(CONSTANTS.PAGES.RESEARCH, CONSTANTS.SUBPAGES.RESEARCH)) return
          }
        }

        if (!navigation.checkPage(CONSTANTS.PAGES.RESEARCH, CONSTANTS.SUBPAGES.RESEARCH)) return
      }

      await sleep(3100)
      buttonsList = getAllButtons()
    }
  }
}

const hasResearches = () => {
  const resNavButton = navigation.getPagesSelector().find((page) => page.innerText.includes(CONSTANTS.PAGES.RESEARCH))

  if (resNavButton) {
    const researchesAvailable = resNavButton.querySelector('span.inline-block')
    if (researchesAvailable) {
      return true
    }
  }

  return false
}

export default {
  page: CONSTANTS.PAGES.RESEARCH,
  subpage: CONSTANTS.SUBPAGES.RESEARCH,
  enabled: () => userEnabled() && navigation.hasPage(CONSTANTS.PAGES.RESEARCH) && getAllowedResearch().length && hasResearches(),
  action: async () => {
    await navigation.switchSubPage(CONSTANTS.SUBPAGES.RESEARCH, CONSTANTS.PAGES.RESEARCH)

    if (navigation.checkPage(CONSTANTS.PAGES.RESEARCH, CONSTANTS.SUBPAGES.RESEARCH)) await executeAction()
  },
}
