import { CONSTANTS, navigation, selectors, logger, sleep, state } from '../utils'

export default {
  id: CONSTANTS.PAGES.RESEARCH,
  enabled: () => navigation.hasPage(CONSTANTS.PAGES.RESEARCH) && state.lastVisited[CONSTANTS.PAGES.RESEARCH] < state.lastVisited[CONSTANTS.PAGES.BUILD],
  action: async () => {
    await navigation.switchSubPage(CONSTANTS.SUBPAGES.RESEARCH, CONSTANTS.PAGES.RESEARCH)

    const manualResearches = [
      'A moonlight night',
      'Dragon assault',
      'Mysterious robbery',
      'The Fallen Angel reveal',
      'Persuade the nobility',
      'Persuade the people',
    ]

    let buttonsList = selectors.getAllButtons(true).filter((button) => !manualResearches.includes(button.innerText.split('\n').shift()))

    if (buttonsList.length) {
      while (!state.scriptPaused && buttonsList.length) {
        const button = buttonsList.shift()

        button.click()
        logger({ msgLevel: 'log', msg: `Researching ${button.innerText.split('\n').shift()}` })
        await sleep(6000)

        buttonsList = selectors.getAllButtons(true).filter((button) => !manualResearches.includes(button.innerText.split('\n').shift()))
      }
    }

    await sleep(5000)
  },
}
