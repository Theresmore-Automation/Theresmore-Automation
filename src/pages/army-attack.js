import { factions, locations, units } from '../data'
import { CONSTANTS, navigation, logger, sleep, state, resources, selectors, translate, armyCalculator, reactUtil, keyGen } from '../utils'

const fights = factions
  .concat(locations)
  .filter((fight) => !fight.id.includes('orc_war_party_'))
  .map((fight) => {
    return {
      key: fight.id,
      id: translate(fight.id),
      army: fight.army,
      level: fight.level,
    }
  })
  .filter((fight) => typeof fight.level !== 'undefined')

const factionFights = factions.map((faction) => faction.id)

const unassignAll = (controlBox) => {
  const allButtons = [...controlBox.querySelectorAll('button:not(.btn)')]

  for (let i = 0; i < allButtons.length; i++) {
    const button = allButtons[i]
    const parentClasses = button.parentElement.classList.toString()
    const classesToFind = ['absolute', 'top-0', 'right-7']

    if (classesToFind.every((className) => parentClasses.includes(className))) {
      button.click()
      break
    }
  }
}

const assignAll = (controlBox) => {
  const allButtons = [...controlBox.querySelectorAll('button:not(.btn)')]

  for (let i = 0; i < allButtons.length; i++) {
    const button = allButtons[i]
    const parentClasses = button.parentElement.classList.toString()
    const classesToFind = ['absolute', 'top-0', 'right-0']

    if (classesToFind.every((className) => parentClasses.includes(className))) {
      button.click()
      break
    }
  }
}

const userEnabled = () => {
  return (
    (state.options.pages[CONSTANTS.PAGES.ARMY].enabled || false) &&
    (state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.ATTACK].enabled || false)
  )
}

const executeAction = async () => {
  if (!navigation.checkPage(CONSTANTS.PAGES.ARMY, CONSTANTS.SUBPAGES.ATTACK)) return
  if (state.scriptPaused) return

  const container = document.querySelector('div.tab-container.sub-container')

  if (container) {
    const boxes = [...container.querySelectorAll('div.grid > div.flex')]
    const controlBox = boxes.shift()
    let enemyList = []
    let target
    let continueAttacking = true

    const enemySelectorButton = [...controlBox.querySelectorAll('button.btn')].find((button) => reactUtil.getBtnIndex(button, 2) === 1)
    const sendToAttackButton = [...controlBox.querySelectorAll('button.btn')].find((button) => reactUtil.getBtnIndex(button, 0) === 3)

    while (sendToAttackButton && continueAttacking) {
      continueAttacking = false
      if (enemySelectorButton && !enemySelectorButton.disabled && !state.stopAttacks && !state.scriptPaused) {
        enemySelectorButton.click()
        await sleep(250)
        const modals = [...document.querySelectorAll('h3.modal-title')]

        if (modals.length) {
          enemyList = [...modals.map((modal) => [...modal.parentElement.querySelectorAll('h5')]).flat()]
            .map((h5) => {
              const key = reactUtil.getNearestKey(h5, 2)
              if (!keyGen.enemy.check(key)) {
                return undefined
              }
              const enemyDetails = fights.find((fight) => keyGen.enemy.key(fight.key) === key)

              return {
                button: h5,
                ...enemyDetails,
              }
            })
            .filter((fight) => fight)
            .filter((fight) => state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.ATTACK].options[fight.key])

          enemyList.sort((a, b) => {
            let aLevel = a.level || 0
            let bLevel = b.level || 0

            if (factionFights.includes(a.key)) {
              aLevel -= 100
            }

            if (factionFights.includes(b.key)) {
              bLevel -= 100
            }

            return aLevel - bLevel
          })

          target = enemyList.find((fight) => armyCalculator.canWinBattle(fight.key, false, false, state.options.autoSortArmy))

          if (target && !state.scriptPaused) {
            target.button.click()
            await sleep(1000)
          } else {
            const closeButton = modals[0].parentElement.parentElement.parentElement.querySelector('div.absolute > button')
            if (closeButton) {
              closeButton.click()
              await sleep(20)
            }
          }
        }
        if (target && !state.stopAttacks) {
          assignAll(controlBox)

          if (state.options.autoSortArmy) {
            armyCalculator.sortArmy([], false, false)
          }

          if (!sendToAttackButton.disabled && !state.scriptPaused) {
            logger({
              msgLevel: 'log',
              msg: `Launching attack against ${target.id}`,
            })

            if (state.options.turbo.enabled && state.MainStore) {
              state.MainStore.ArmyStore.startAttack()
              continueAttacking = true
              if (state.options.instantArmy.enabled) {
                while (state.MainStore.ArmyStore.attackInProgress) {
                  await sleep(1)
                }
              }
            } else {
              sendToAttackButton.click()
            }
          } else {
            unassignAll(controlBox)
          }
        }

        await sleep(20)
      } else {
        unassignAll(controlBox)
        break
      }
      await sleep(10)
    }
  }
}

const getMinWaitTime = () => {
  let waitTime = 60000

  if (reactUtil.getGameData().StatsStore && reactUtil.getGameData().StatsStore.ngResetNumber) {
    const ngResets = reactUtil.getGameData().StatsStore.ngResetNumber

    for (let i = 0; i < ngResets; i++) {
      waitTime = waitTime / 2
    }
  }

  waitTime = Math.ceil(Math.max(waitTime, 3000) / 2) + 1000

  return waitTime
}

export default {
  page: CONSTANTS.PAGES.ARMY,
  subpage: CONSTANTS.SUBPAGES.ATTACK,
  enabled: () =>
    userEnabled() &&
    navigation.hasPage(CONSTANTS.PAGES.ARMY) &&
    new Date().getTime() - (state.lastVisited[`${CONSTANTS.PAGES.ARMY}${CONSTANTS.SUBPAGES.ATTACK}`] || 0) > getMinWaitTime(),
  action: async () => {
    await navigation.switchSubPage(CONSTANTS.SUBPAGES.ATTACK, CONSTANTS.PAGES.ARMY)

    if (navigation.checkPage(CONSTANTS.PAGES.ARMY, CONSTANTS.SUBPAGES.ATTACK)) await executeAction()
  },
}
