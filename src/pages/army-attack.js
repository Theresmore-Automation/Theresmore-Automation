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
  const allButtons = [...controlBox.querySelectorAll('button')]

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
    let targetSelected = false
    let army = []
    let userUnits = []
    let target
    let attackLog = { attackUnits: [] }

    const enemySelectorButton = controlBox.querySelector('button.btn')
    const sendToAttackButton = [...controlBox.querySelectorAll('button.btn')].find((button) => reactUtil.getBtnIndex(button, 0) === 1)
    unassignAll(controlBox)

    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i]
      const unitKey = reactUtil.getNearestKey(box, 2)
      const removeUnitButton = box.querySelector('div.inline-flex button.btn-red.rounded-none')
      const addUnitButton = box.querySelector('div.inline-flex button.btn-green.rounded-none')

      const unitDetails = armyCalculator.applyUnitMods(units.find((unit) => keyGen.armyAttack.key(unit.id) === unitKey))

      userUnits.push({
        ...unitDetails,
        key: unitDetails.id,
        id: unitDetails.id,
        box,
        removeUnitButton,
        addUnitButton,
      })
    }

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
          .filter((fight) => {
            const army = armyCalculator.getEnemyArmy(fight.key)
            const enemyStats = armyCalculator.calculateEnemyStats(army)
            const canWin = armyCalculator.canWinBattle(enemyStats, userUnits, false)

            return canWin
          })

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

        if (enemyList.length && !state.scriptPaused) {
          target = enemyList.shift()
          targetSelected = true
          target.button.click()
          attackLog.target = target
          await sleep(1000)
        } else {
          targetSelected = false
          const closeButton = modals[0].parentElement.parentElement.parentElement.querySelector('div.absolute > button')
          if (closeButton) {
            closeButton.click()
            await sleep(20)
          }
        }
      }
    }

    if (targetSelected && target && !state.stopAttacks) {
      army = armyCalculator.getEnemyArmy(target.key)

      if (army.length && userUnits.length && sendToAttackButton) {
        attackLog.army = army
        attackLog.userUnits = userUnits

        const enemyStats = armyCalculator.calculateEnemyStats(army)

        const canWin = armyCalculator.canWinBattle(enemyStats, userUnits, false)

        if (canWin) {
          const userStats = {
            attack: [0, 0, 0, 0, 0],
            defense: [0, 0, 0, 0, 0],
          }

          const sortMethod = (type = 'defense') => {
            return (a, b) => {
              const aHasAdvantage = a.category !== 4 ? enemyStats.defense[a.category + 1] : enemyStats.defense[1]
              const bHasAdvantage = b.category !== 4 ? enemyStats.defense[b.category + 1] : enemyStats.defense[1]

              const aGivesAdvantage = a.category !== 1 ? enemyStats.attack[a.category - 1] : enemyStats.attack[4]
              const bGivesAdvantage = b.category !== 1 ? enemyStats.attack[b.category - 1] : enemyStats.attack[4]

              if (aGivesAdvantage === bGivesAdvantage) {
                if (aHasAdvantage === bHasAdvantage) {
                  if (type === 'defense') {
                    return b.defense - a.defense
                  } else {
                    return b.attack - a.attack
                  }
                } else {
                  return bHasAdvantage - aHasAdvantage
                }
              } else {
                return aGivesAdvantage - bGivesAdvantage
              }
            }
          }

          const defUnits = [...userUnits].sort(sortMethod('defense'))
          const attUnits = [...userUnits].sort(sortMethod('attack'))

          let gotDef = false
          let gotAtt = false
          for (let i = 0; i < defUnits.length && !state.scriptPaused; i++) {
            if (gotDef) break

            const unit = defUnits[i]

            while (!gotDef && !state.scriptPaused) {
              const damages = armyCalculator.calculateDamages(enemyStats, userStats)
              attackLog.damages = damages
              if (damages.enemy.enemyDefense < damages.user.userAttack) gotAtt = true
              if (damages.enemy.enemyAttack < damages.user.userDefense) gotDef = true
              if (gotDef) break

              unit.addUnitButton = unit.box.querySelector('div.inline-flex button.btn-green.rounded-none')

              if (unit.addUnitButton) {
                attackLog.attackUnits.push(unit)
                unit.addUnitButton.click()
                await sleep(20)

                if (sendToAttackButton.classList.toString().includes('btn-off')) {
                  attackLog.attackUnits.pop()
                  unit.removeUnitButton = unit.box.querySelector('div.inline-flex button.btn-red.rounded-none')
                  unit.removeUnitButton.click()
                  await sleep(20)
                  break
                }

                userStats.attack[unit.category] += unit.attack
                userStats.defense[unit.category] += unit.defense
              } else {
                break
              }
            }
          }

          if (!gotAtt) {
            for (let i = 0; i < attUnits.length && !state.scriptPaused; i++) {
              if (gotAtt) break

              const unit = attUnits[i]

              while (!gotAtt && !state.scriptPaused) {
                const damages = armyCalculator.calculateDamages(enemyStats, userStats)
                attackLog.damages = damages
                if (damages.enemy.enemyDefense < damages.user.userAttack) gotAtt = true
                if (damages.enemy.enemyAttack < damages.user.userDefense) gotDef = true
                if (gotAtt) break

                unit.addUnitButton = unit.box.querySelector('div.inline-flex button.btn-green.rounded-none')

                if (unit.addUnitButton) {
                  attackLog.attackUnits.push(unit)
                  unit.addUnitButton.click()
                  await sleep(20)

                  if (sendToAttackButton.classList.toString().includes('btn-off')) {
                    attackLog.attackUnits.pop()
                    unit.removeUnitButton = unit.box.querySelector('div.inline-flex button.btn-red.rounded-none')
                    unit.removeUnitButton.click()
                    await sleep(20)
                    break
                  }

                  userStats.attack[unit.category] += unit.attack
                  userStats.defense[unit.category] += unit.defense
                } else {
                  break
                }
              }
            }
          }

          attackLog.gotAtt = gotAtt
          attackLog.gotDef = gotDef

          logger({ msgLevel: 'debug', msg: attackLog })

          if (gotAtt && gotDef && targetSelected && !state.scriptPaused) {
            const attackLogUnits = {}
            for (let i = 0; i < attackLog.attackUnits.length; i++) {
              const unit = attackLog.attackUnits[i]
              if (!attackLogUnits[unit.id]) {
                attackLogUnits[unit.id] = { id: unit.id, count: 1, attack: unit.attack, defense: unit.defense }
              } else {
                attackLogUnits[unit.id].count += 1
              }
            }

            logger({
              msgLevel: 'log',
              msg: `Launching attack against ${target.id}.
Using army: ${Object.keys(attackLogUnits)
                .map((key) => `${key} (${attackLogUnits[key].attack}/${attackLogUnits[key].defense}): ${attackLogUnits[key].count}`)
                .join(', ')}.
Estimated damage:
  enemy: attack: ${attackLog.damages.enemy.enemyAttack}, defense: ${attackLog.damages.enemy.enemyDefense}
  user:  attack: ${attackLog.damages.user.userAttack}, defense: ${attackLog.damages.user.userDefense}`,
            })
            sendToAttackButton.click()
            await sleep(20)
          } else {
            unassignAll(controlBox)
            await sleep(20)
          }
        } else {
          unassignAll(controlBox)
          await sleep(20)
        }
      }
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
