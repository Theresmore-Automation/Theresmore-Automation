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
          let gotAtt = false
          let gotDef = false

          const army = armyCalculator.getEnemyArmy(dangerousFightsMapping[research.id])

          const enemyStats = armyCalculator.calculateEnemyStats(army)

          const userStats = {
            attack: [0, 0, 0, 0, 0],
            defense: [0, 0, 0, 0, 0],
          }
          const garrison = armyCalculator.getGarrison()

          for (let i = 0; i < garrison.length; i++) {
            const unit = garrison[i]
            userStats.attack[unit.category] += unit.attack * unit.value
            userStats.defense[unit.category] += unit.defense * unit.value
          }

          const damages = armyCalculator.calculateDamages(enemyStats, userStats)
          if (damages.enemy.enemyDefense < damages.user.userAttack) gotAtt = true
          if (damages.enemy.enemyAttack < damages.user.userDefense) gotDef = true

          if (gotAtt && gotDef) {
            state.stopAttacks = false
          } else {
            state.stopAttacks = true
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
