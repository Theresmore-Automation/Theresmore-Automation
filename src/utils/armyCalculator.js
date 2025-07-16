import { factions, locations, units } from '../data'
import translate from './translate'
import reactUtil from './reactUtil'

const fights = factions.concat(locations).map((fight) => {
  return {
    key: fight.id,
    id: translate(fight.id),
    army: fight.army,
  }
})

const applyUnitMods = (unit) => {
  const unitCopy = { ...unit }
  let run = reactUtil.getGameData().run

  if (unitCopy && run && run.modifiers) {
    let bonusAttack = 0
    let bonusDefense = 0

    const unitMods = run.modifiers.find((mod) => mod.id === unitCopy.id)

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
          }
        }
      }
    }

    unitCopy.attack += bonusAttack
    unitCopy.defense += bonusDefense
  }

  return unitCopy
}

const getEnemyArmy = (enemyId) => {
  const difficultyMode = parseInt(reactUtil.getGameData().SettingsStore.difficultyMode, 10) || 0
  const difficultyModeMultiplier = difficultyMode === 1 ? 1.5 : difficultyMode === 2 ? 2 : difficultyMode === 3 ? 4.5 : 1
  const randomBonus = difficultyMode === 1 ? 1.1 : difficultyMode === 2 ? 1.2 : difficultyMode === 3 ? 1.3 : 1
  const army = fights
    .find((fight) => fight.key === enemyId || fight.id === enemyId)
    .army.map((unit) => {
      const unitDetails = units.find((enemy) => enemy.id === unit.id)
      const value = unitDetails.cap ? unit.value : Math.round(unit.value * difficultyModeMultiplier * randomBonus)

      return {
        ...unit,
        ...unitDetails,
        value,
      }
    })

  return army
}

const getUserArmy = (isDefending = false, onlyAvailable = false) => {
  const userArmy = []

  let run = reactUtil.getGameData().run

  if (run && run.army) {
    for (let i = 0; i < run.army.length; i++) {
      const unit = run.army[i]
      const unitsValue = onlyAvailable ? unit.value - unit.away : unit.value

      if (unitsValue) {
        const unitDetails = units.find((unitDetails) => unitDetails.id === unit.id)

        if (unitDetails) {
          if (unitDetails.category === 0) {
            if (!isDefending || unit.id !== 'settlement_defenses') {
              continue
            }
          }

          userArmy.push({ ...applyUnitMods(unitDetails), key: unitDetails.id, value: unitsValue })
        }
      }
    }
  }

  return userArmy
}

const sortArmy = (army = [], isDefending = false) => {
  if (!army.length) {
    army = getUserArmy(isDefending, false)
  }

  const userOrder = []
  const unitStats = {}

  army.forEach((unit) => {
    if (!userOrder.includes(unit.id)) {
      userOrder.push(unit.id)
      unitStats[unit.id] = {
        attack: unit.attack,
        defense: unit.defense,
        splash: unit.splash || 0,
        trample: unit.trample || 0,
      }
    }
  })

  userOrder.sort((a, b) => {
    if (a === 'settlement_defenses') {
      return -1
    } else if (b === 'settlement_defenses') {
      return 1
    }

    const aStats = unitStats[a]
    const bStats = unitStats[b]

    if (aStats.splash === bStats.splash && aStats.splash === 0) {
      if (aStats.trample === bStats.trample && aStats.trample === 0) {
        if (aStats.defense === bStats.defense) {
          return aStats.attack - bStats.attack
        } else {
          return bStats.defense - aStats.defense
        }
      } else {
        return aStats.trample * aStats.attack - bStats.trample * bStats.attack
      }
    } else {
      return aStats.splash * aStats.attack - bStats.splash * bStats.attack
    }
  })

  if (isDefending) {
    reactUtil.getGameData().run.armyOrder.defense = userOrder
  } else {
    reactUtil.getGameData().run.armyOrder.away = userOrder
  }

  if (!reactUtil.getGameData().ArmyStore.orderByBattleOrder) {
    reactUtil.getGameData().ArmyStore.toggleOrderByBattleOrder()
  }

  return userOrder
}

const generateArmy = (army = [], attacker = false, isDefending = false, autoSortArmy = false, isUser = false) => {
  army = army.filter((unit) => (isDefending ? true : unit.category))
  let orderByBattleOrder = !!reactUtil.getGameData().ArmyStore.orderByBattleOrder
  let userOrder = isDefending ? reactUtil.getGameData().run.armyOrder.defense : reactUtil.getGameData().run.armyOrder.away

  if (isUser && autoSortArmy) {
    sortArmy(army, isDefending)
  }

  const units = []
  army.forEach((squad) => {
    for (let i = 0; i < squad.value; i++) {
      let sortOrder = Number(attacker ? squad.category : squad.order)
      if (isUser && orderByBattleOrder) {
        sortOrder = userOrder.indexOf(squad.id)
      }

      units.push({
        ...squad,
        sortOrder,
      })
    }
  })

  return units.sort((a, b) => a.sortOrder - b.sortOrder)
}

const canWinBattle = (enemyId, isDefending = false, onlyAvailable = false, autoSortArmy = false) => {
  const forces = {
    player: {
      attack: generateArmy(getUserArmy(isDefending, onlyAvailable), true, isDefending, autoSortArmy, true),
      defense: generateArmy(getUserArmy(isDefending, onlyAvailable), false, isDefending, autoSortArmy, true),
    },
    enemy: {
      attack: generateArmy(getEnemyArmy(enemyId), true),
      defense: generateArmy(getEnemyArmy(enemyId), false),
    },
  }

  let result = 0
  while (!result) {
    const deadUnits = {
      player: [],
      enemy: [],
    }

    forces.player.attack.forEach((attUnit) => {
      if (!forces.enemy.defense.length) {
        return
      }

      const splash = attUnit.splash || 1
      for (let i = 0; i < splash; i++) {
        if (typeof forces.enemy.defense[i] === 'undefined') {
          break
        }

        let unitAttack = attUnit.attack
        let eff = 1
        let effectiveType = attUnit.cat === 0 ? 0 : attUnit.cat === 4 ? 1 : attUnit.cat + 1
        if (effectiveType === forces.enemy.defense[i].cat) {
          eff *= 2
        }

        if (unitAttack * eff >= forces.enemy.defense[i].defense) {
          deadUnits.enemy.push(forces.enemy.defense[i].id)
          forces.enemy.defense.splice(i, 1)
        } else {
          forces.enemy.defense[i].defense -= unitAttack
        }
      }
    })

    forces.enemy.attack.forEach((attUnit) => {
      if (!forces.player.defense.length) {
        return
      }

      const splash = attUnit.splash || 1
      for (let i = 0; i < splash; i++) {
        if (typeof forces.player.defense[i] === 'undefined') {
          break
        }

        let unitAttack = attUnit.attack
        let eff = 1
        let effectiveType = attUnit.cat === 0 ? 0 : attUnit.cat === 4 ? 1 : attUnit.cat + 1
        if (effectiveType === forces.player.defense[i].cat) {
          eff *= 2
        }

        if (unitAttack * eff >= forces.player.defense[i].defense) {
          deadUnits.player.push(forces.player.defense[i].id)
          forces.player.defense.splice(i, 1)
        } else {
          forces.player.defense[i].defense -= unitAttack
        }
      }
    })

    if (deadUnits.enemy.length) {
      deadUnits.enemy.forEach((deadUnitId) => {
        const attackIndex = forces.enemy.attack.findIndex((unit) => unit.id === deadUnitId)

        if (attackIndex > -1) {
          forces.enemy.attack.splice(attackIndex, 1)
        }
      })
    }

    if (deadUnits.player.length) {
      deadUnits.player.forEach((deadUnitId) => {
        const attackIndex = forces.player.attack.findIndex((unit) => unit.id === deadUnitId)

        if (attackIndex > -1) {
          forces.player.attack.splice(attackIndex, 1)
        }
      })
    }

    if (!forces.enemy.attack.length || !forces.player.attack.length) {
      result = forces.player.attack.length ? 1 : 2
    }
  }

  return result === 1 ? true : false
}

export default { canWinBattle, sortArmy }
