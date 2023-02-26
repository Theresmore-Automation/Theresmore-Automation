import { tech } from '../data'
import { CONSTANTS, navigation, selectors, logger, sleep, state, translate, armyCalculator } from '../utils'

const dangerousFightsMapping = {
  'A moonlight night': 'army_of_goblin',
  'A moonlit night': 'army_of_goblin',
  'Dragon assault': 'army_of_dragon',
  'Mysterious robbery': 'fallen_angel_army_1',
  'The Fallen Angel reveal': 'fallen_angel_army_2',
  'The Orc Horde': 'orc_horde_boss',
  'Kobold nation': 'king_kobold_nation',
  'Barbarian tribes': 'barbarian_horde',
}

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
  let ignoredTech = []
  let buttonsList = getAllButtons()

  if (buttonsList.length) {
    while (!state.scriptPaused && buttonsList.length) {
      const highestPrio = buttonsList[0].prio
      buttonsList = buttonsList.filter((tech) => tech.prio === highestPrio)

      for (let i = 0; i < buttonsList.length; i++) {
        const research = buttonsList[i]

        if (
          state.options.pages[CONSTANTS.PAGES.RESEARCH].subpages[CONSTANTS.SUBPAGES.RESEARCH].options.dangerousFights &&
          dangerousFightsMapping[research.id]
        ) {
          const army = armyCalculator.getEnemyArmy(dangerousFightsMapping[research.id])

          const enemyStats = armyCalculator.calculateEnemyStats(army)
          const garrison = armyCalculator.getGarrison()

          const canWinNow = armyCalculator.canWinBattle(enemyStats, garrison, true, true)

          if (canWinNow) {
            state.stopAttacks = false
            console.log('Will try starting a dangerous research (canWinNow). Values:')
            console.log('research', research.id)
            console.log('fight', dangerousFightsMapping[research.id])
            console.log('army', army)
            console.log('enemyStats', enemyStats)
            console.log('garrison', garrison)
          } else {
            ignoredTech.push(research.id)

            const canWinEmpty = armyCalculator.canWinBattle(enemyStats, garrison, false, true)
            if (canWinEmpty) {
              console.log('Will try starting a dangerous research later (canWinEmpty). Values:')
              console.log('research', research.id)
              console.log('fight', dangerousFightsMapping[research.id])
              console.log('army', army)
              console.log('enemyStats', enemyStats)
              console.log('garrison', garrison)
              state.stopAttacks = true
            } else {
              state.stopAttacks = false
            }
            continue
          }
        }

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
      buttonsList = getAllButtons().filter((tech) => !ignoredTech.includes(tech.id))
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
