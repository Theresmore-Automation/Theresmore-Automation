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

const getRandomNumber = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)

  return Math.floor(Math.random() * (max - min + 1) + min)
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

const generateArmy = (army = [], attacker = false, isDefending = false) => {
  army = army.filter((unit) => (isDefending ? true : unit.category))

  const units = []
  army.forEach((squad) => {
    for (let i = 0; i < squad.value; i++) {
      units.push({
        ...squad,
        sortOrder: Number(
          attacker
            ? squad.category.toString() + (1000 + getRandomNumber(0, 900)).toString()
            : squad.order.toString() + (1e3 + getRandomNumber(0, 900)).toString()
        ),
      })
    }
  })

  return units.sort((a, b) => a.sortOrder - b.sortOrder)
}

const canWinBattle = (enemyId, isDefending = false, onlyAvailable = false) => {
  const forces = {
    player: {
      attack: generateArmy(getUserArmy(isDefending, onlyAvailable), true, isDefending),
      defense: generateArmy(getUserArmy(isDefending, onlyAvailable), false, isDefending),
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

    let enemyUnitIdx = 0
    let playerUnitIdx = 0

    forces.player.attack.forEach((attUnit) => {
      if (typeof forces.enemy.defense[enemyUnitIdx] !== 'undefined') {
        let unitAttack = attUnit.attack
        let eff = 1
        let effectiveType = attUnit.cat === 0 ? 0 : attUnit.cat === 4 ? 1 : attUnit.cat + 1
        if (effectiveType === forces.enemy.defense[enemyUnitIdx].cat) {
          eff *= 2
        }

        if (unitAttack * eff >= forces.enemy.defense[enemyUnitIdx].defense) {
          deadUnits.enemy.push(forces.enemy.defense[enemyUnitIdx].id)
          enemyUnitIdx += 1
        } else {
          forces.enemy.defense[enemyUnitIdx].defense -= unitAttack
        }
      }
    })

    forces.enemy.attack.forEach((attUnit) => {
      if (typeof forces.player.defense[playerUnitIdx] !== 'undefined') {
        let unitAttack = attUnit.attack
        let eff = 1
        let effectiveType = attUnit.cat === 0 ? 0 : attUnit.cat === 4 ? 1 : attUnit.cat + 1
        if (effectiveType === forces.player.defense[playerUnitIdx].cat) {
          eff *= 2
        }

        if (unitAttack * eff >= forces.player.defense[playerUnitIdx].defense) {
          deadUnits.player.push(forces.player.defense[playerUnitIdx].id)
          playerUnitIdx += 1
        } else {
          forces.player.defense[playerUnitIdx].defense -= unitAttack
        }
      }
    })

    if (deadUnits.enemy.length) {
      deadUnits.enemy.forEach((deadUnitId) => {
        const attackIndex = forces.enemy.attack.findIndex((unit) => unit.id === deadUnitId)
        const defenseIndex = forces.enemy.defense.findIndex((unit) => unit.id === deadUnitId)

        if (attackIndex > -1) {
          forces.enemy.attack.splice(attackIndex, 1)
        }

        if (defenseIndex > -1) {
          forces.enemy.defense.splice(defenseIndex, 1)
        }
      })
    }

    if (deadUnits.player.length) {
      deadUnits.player.forEach((deadUnitId) => {
        const attackIndex = forces.player.attack.findIndex((unit) => unit.id === deadUnitId)
        const defenseIndex = forces.player.defense.findIndex((unit) => unit.id === deadUnitId)

        if (attackIndex > -1) {
          forces.player.attack.splice(attackIndex, 1)
        }

        if (defenseIndex > -1) {
          forces.player.defense.splice(defenseIndex, 1)
        }
      })
    }

    if (!forces.enemy.attack.length || !forces.player.attack.length) {
      result = forces.player.attack.length ? 1 : 2
    }
  }

  return result === 1 ? true : false
}

export default { canWinBattle }
