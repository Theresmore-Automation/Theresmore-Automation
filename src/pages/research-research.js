import { tech } from '../data'
import { CONSTANTS, navigation, selectors, logger, sleep, state, translate, armyCalculator, reactUtil, keyGen } from '../utils'

const dangerousFightsMapping = {
  moonlight_night: 'army_of_goblin',
  dragon_assault: 'army_of_dragon',
  mysterious_robbery: 'fallen_angel_army_1',
  fallen_angel: 'fallen_angel_army_2',
  orc_horde: 'orc_horde_boss',
  kobold_nation: 'king_kobold_nation',
  barbarian_tribes: 'barbarian_horde',
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
      let button = buttonsList.find((button) => reactUtil.getNearestKey(button, 6) === keyGen.research.key(tech.key))

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
          dangerousFightsMapping[research.key]
        ) {
          const army = armyCalculator.getEnemyArmy(dangerousFightsMapping[research.key])

          const enemyStats = armyCalculator.calculateEnemyStats(army)
          const garrison = armyCalculator.getGarrison(true)

          const canWinNow = armyCalculator.canWinBattle(enemyStats, garrison, true, true)

          if (canWinNow) {
            state.stopAttacks = false
            logger({ msgLevel: 'debug', msg: 'Will try starting a dangerous research (canWinNow). Values:' })
            logger({ msgLevel: 'debug', msg: `Research: ${research.id} (${research.key}). Fight: ${dangerousFightsMapping[research.key]}` })
            logger({ msgLevel: 'debug', msg: `Army: ${JSON.stringify(army)}` })
            logger({ msgLevel: 'debug', msg: `Enemy stats: ${JSON.stringify(enemyStats)}` })
            logger({ msgLevel: 'debug', msg: `Garrison: ${JSON.stringify(garrison)}` })
          } else {
            ignoredTech.push(research.id)
            logger({ msgLevel: 'debug', msg: `Can't win ${research.id}, ignoring it for this round.` })

            const canWinEmpty = armyCalculator.canWinBattle(enemyStats, garrison, false, true)
            if (canWinEmpty) {
              logger({ msgLevel: 'debug', msg: 'Will try starting a dangerous research later (canWinEmpty). Values:' })
              logger({ msgLevel: 'debug', msg: `Research: ${research.id} (${research.key}). Fight: ${dangerousFightsMapping[research.key]}` })
              logger({ msgLevel: 'debug', msg: `Army: ${JSON.stringify(army)}` })
              logger({ msgLevel: 'debug', msg: `Enemy stats: ${JSON.stringify(enemyStats)}` })
              logger({ msgLevel: 'debug', msg: `Garrison: ${JSON.stringify(garrison)}` })
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
          const redConfirmButton = [...document.querySelectorAll('#headlessui-portal-root .btn.btn-red')].find(
            (button) => reactUtil.getBtnIndex(button, 0) === 1
          )

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
  const pageIndex = CONSTANTS.PAGES_INDEX[CONSTANTS.PAGES.RESEARCH]
  const resNavButton = navigation.getPagesSelector().find((page) => reactUtil.getBtnIndex(page, 1) === pageIndex)

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
