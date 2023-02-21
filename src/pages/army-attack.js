import { factions, locations, units } from '../data'
import { CONSTANTS, navigation, logger, sleep, state, resources, selectors, translate } from '../utils'

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

const userEnabled = () => {
  return (
    (state.options.pages[CONSTANTS.PAGES.ARMY].enabled || false) &&
    (state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.ATTACK].enabled || false)
  )
}

const calculateDamages = (enemyStats, userStats) => {
  let enemyAttack = 0
  let enemyDefense = 0

  let userAttack = 0
  let userDefense = 0
  // ['Recon', 'Ranged', 'Shock', 'Tank', 'Rider']
  for (let i = 1; i < enemyStats.attack.length; i++) {
    let j = i + 1
    if (i === 4) j = 1

    enemyAttack += userStats.attack[j] ? 2 * enemyStats.attack[i] : enemyStats.attack[i]
    enemyDefense += enemyStats.defense[i]
  }

  for (let i = 1; i < userStats.attack.length; i++) {
    let j = i + 1
    if (i === 4) j = 1

    userAttack += enemyStats.attack[j] ? 2 * userStats.attack[i] : userStats.attack[i]
    userDefense += userStats.defense[i]
  }

  return {
    enemy: { enemyAttack, enemyDefense },
    user: { userAttack, userDefense },
  }
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

    let run = window.localStorage.getItem('run')
    if (run) {
      run = JSON.parse(run)
    }

    const enemySelectorButton = controlBox.querySelector('button.btn')
    const sendToAttackButton = [...controlBox.querySelectorAll('button.btn')].find((button) => button.innerText.includes('Send to attack'))

    if (enemySelectorButton && !enemySelectorButton.disabled) {
      enemySelectorButton.click()
      await sleep(25)
      const modal = [...document.querySelectorAll('h3.modal-title')].find((h3) => h3.innerText.includes('enemies'))

      if (modal) {
        enemyList = [...modal.parentElement.querySelectorAll('h5')].map((h5) => {
          const enemyDetails = fights.find((fight) => fight.id === h5.innerText.trim())

          return {
            button: h5,
            ...enemyDetails,
          }
        })

        enemyList.sort((a, b) => {
          if (factionFights.includes(a.key)) {
            a.level -= 100
          }

          if (factionFights.includes(b.key)) {
            b.level -= 100
          }

          return a.level - b.level
        })

        if (enemyList.length) {
          targetSelected = true
          enemyList[0].button.click()
          await sleep(25)
        } else {
          const closeButton = modal.parentElement.parentElement.parentElement.querySelector('div.absolute > button')
          if (closeButton) {
            closeButton.click()
            await sleep(25)
          }
        }
      }
    }

    if (targetSelected) {
      const difficultyMode = window.localStorage.getItem('difficultyMode')
      const difficultyModeMultiplier = difficultyMode === '0' ? 1 : difficultyMode === '1' ? 1.5 : 2
      const randomBonus = 1.3
      army = enemyList[0].army.map((unit) => {
        const unitDetails = units.find((enemy) => enemy.id === unit.id)

        return {
          ...unit,
          ...unitDetails,
          value: Math.round(unit.value * difficultyModeMultiplier * randomBonus),
        }
      })
    }

    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i]
      const name = box.querySelector('h5.font-bold').innerText.trim()
      let removeUnitButton = box.querySelector('div.inline-flex button.btn-red')
      const addUnitButton = box.querySelector('div.inline-flex button.btn-green')

      while (removeUnitButton) {
        removeUnitButton.click()
        await sleep(25)
        removeUnitButton = box.querySelector('div.inline-flex button.btn-red')
      }

      const unitDetails = units.find((unit) => translate(unit.id, 'uni_') === name)

      if (run && run.modifiers) {
        let bonusAttack = 0
        let bonusDefense = 0

        const unitMods = run.modifiers.find((mod) => mod.id === unitDetails.id)

        if (unitMods && unitMods.mods) {
          for (let i = 0; i < unitMods.mods.length; i++) {
            const mod = unitMods.mods[i]

            if (mod.type === 'stat') {
              if (!mod.perc) {
                if (mod.id === 'attack') {
                  bonusAttack += mod.value
                }

                if (mod.id === 'defense') {
                  bonusDefense += mod.value
                }
              } else {
                if (mod.id === 'attack') {
                  bonusAttack += (mod.value / 100 + 1) * unitDetails.attack
                }

                if (mod.id === 'defense') {
                  bonusDefense += (mod.value / 100 + 1) * unitDetails.defense
                }
              }
            }
          }
        }

        unitDetails.attack += bonusAttack
        unitDetails.defense += bonusDefense
      }

      userUnits.push({
        ...unitDetails,
        key: unitDetails.id,
        id: name,
        box,
        removeUnitButton,
        addUnitButton,
      })
    }

    if (targetSelected && army.length && userUnits.length && sendToAttackButton) {
      const enemyStats = {
        attack: [0, 0, 0, 0, 0],
        defense: [0, 0, 0, 0, 0],
      }

      const userStats = {
        attack: [0, 0, 0, 0, 0],
        defense: [0, 0, 0, 0, 0],
      }

      for (let i = 0; i < army.length; i++) {
        enemyStats.attack[army[i].category] += army[i].attack * army[i].value
        enemyStats.defense[army[i].category] += army[i].defense * army[i].value
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
      for (let i = 0; i < defUnits.length; i++) {
        if (gotDef) break

        const unit = defUnits[i]

        while (!gotDef) {
          const damages = calculateDamages(enemyStats, userStats)
          if (damages.enemy.enemyDefense < damages.user.userAttack) gotAtt = true
          if (damages.enemy.enemyAttack < damages.user.userDefense) gotDef = true
          if (gotDef) break

          unit.removeUnitButton = unit.box.querySelector('div.inline-flex button.btn-red')
          unit.addUnitButton = unit.box.querySelector('div.inline-flex button.btn-green')

          if (unit.addUnitButton) {
            unit.addUnitButton.click()
            await sleep(25)

            if (sendToAttackButton.classList.toString().includes('btn-off')) {
              unit.removeUnitButton.click()
              await sleep(25)
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
        for (let i = 0; i < attUnits.length; i++) {
          if (gotAtt) break

          const unit = attUnits[i]

          while (!gotAtt) {
            const damages = calculateDamages(enemyStats, userStats)
            if (damages.enemy.enemyDefense < damages.user.userAttack) gotAtt = true
            if (damages.enemy.enemyAttack < damages.user.userDefense) gotDef = true
            if (gotAtt) break

            unit.removeUnitButton = unit.box.querySelector('div.inline-flex button.btn-red')
            unit.addUnitButton = unit.box.querySelector('div.inline-flex button.btn-green')

            if (unit.addUnitButton) {
              unit.addUnitButton.click()
              await sleep(25)

              if (sendToAttackButton.classList.toString().includes('btn-off')) {
                unit.removeUnitButton.click()
                await sleep(25)
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

      if (state.scriptPaused) return

      if (gotAtt && gotDef) {
        logger({ msgLevel: 'log', msg: `Launching attack against ${enemyList[0].id}` })
        sendToAttackButton.click()
        await sleep(25)
      } else {
        for (let i = 0; i < userUnits.length; i++) {
          let removeUnitButton = userUnits[i].box.querySelector('div.inline-flex button.btn-red')
          while (removeUnitButton) {
            removeUnitButton.click()
            await sleep(25)
            removeUnitButton = userUnits[i].box.querySelector('div.inline-flex button.btn-red')
          }
        }
      }
    }
  }
}

export default {
  page: CONSTANTS.PAGES.ARMY,
  subpage: CONSTANTS.SUBPAGES.ATTACK,
  enabled: () =>
    userEnabled() &&
    navigation.hasPage(CONSTANTS.PAGES.ARMY) &&
    new Date().getTime() - (state.lastVisited[`${CONSTANTS.PAGES.ARMY}${CONSTANTS.SUBPAGES.ATTACK}`] || 0) > 35 * 1000,
  action: async () => {
    await navigation.switchSubPage(CONSTANTS.SUBPAGES.ATTACK, CONSTANTS.PAGES.ARMY)

    if (navigation.checkPage(CONSTANTS.PAGES.ARMY, CONSTANTS.SUBPAGES.ATTACK)) await executeAction()
  },
}
