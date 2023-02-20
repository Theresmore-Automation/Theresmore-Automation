import { units } from '../data'
import { CONSTANTS, navigation, logger, sleep, state, resources, selectors, translate } from '../utils'

const getUnitsList = () => {
  const unitsObject = state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.ARMY].options

  if (Object.keys(unitsObject).length) {
    let unitsList = Object.keys(unitsObject)
      .filter((key) => !key.includes('prio_'))
      .filter((key) => !!unitsObject[key])
      .filter((key) => !!unitsObject[`prio_${key}`])
      .map((key) => {
        const unit = {
          key: key,
          id: translate(key, 'uni_'),
          max: unitsObject[key] === -1 ? 99999 : unitsObject[key],
          prio: unitsObject[`prio_${key}`],
        }

        return unit
      })
      .sort((a, b) => {
        return b.prio - a.prio
      })

    return unitsList
  }

  return []
}

const userEnabled = () => {
  return (
    (state.options.pages[CONSTANTS.PAGES.ARMY].enabled || false) &&
    (state.options.pages[CONSTANTS.PAGES.ARMY].subpages[CONSTANTS.SUBPAGES.ARMY].enabled || false)
  )
}

const getArmyNumbers = () => {
  return document
    .querySelectorAll('div[role="tablist"]')[1]
    .querySelector('[aria-selected="true"]')
    .innerText.replace('Army', '')
    .split('/')
    .map((text) => +text.trim())
}

const getControls = () => {
  const armyNumbers = getArmyNumbers()
  const allButtons = selectors.getAllButtons(true)
  const unitsOptionsList = getUnitsList()
  const controls = {
    units: [],
    counts: {},
  }

  allButtons.forEach((button) => {
    const buttonText = button.innerText.trim()

    if (buttonText === '+1') {
      controls.counts['1'] = button
    } else if (buttonText === '+10') {
      controls.counts['10'] = button
    } else if (buttonText === '+50') {
      controls.counts['50'] = button
    } else if (buttonText) {
      const unitDetails = buttonText.split('\n')
      const unit = units.find((unit) => translate(unit.id, 'uni_') === unitDetails[0].trim())

      if (unit) {
        if (unitDetails[1]) {
          unit.count = +unitDetails[1]
        }

        unit.button = button
        unit.key = unit.id

        const unitOptions = unitsOptionsList.find((unitOption) => unitOption.key === unit.key)

        if (unitOptions) {
          const unitToAdd = { ...unit, ...unitOptions }

          if (unitToAdd.cap) {
            unitToAdd.max = Math.min(unitToAdd.cap, unitToAdd.max)
          }

          unitToAdd.max = Math.min(armyNumbers[1] - armyNumbers[0], unitToAdd.max)

          if (unitToAdd.max > unitToAdd.count) {
            controls.units.push(unitToAdd)
          }
        }
      }
    }
  })

  controls.units.sort((a, b) => b.prio - a.prio)

  return controls
}

const isFull = () => {
  const armyNumbers = getArmyNumbers()
  return armyNumbers[0] >= armyNumbers[1]
}

const executeAction = async () => {
  if (isFull()) return
  if (!navigation.checkPage(CONSTANTS.PAGES.ARMY, CONSTANTS.SUBPAGES.ARMY)) return
  if (state.scriptPaused) return

  let controls = getControls()

  if (controls.units.length) {
    while (!state.scriptPaused && controls.units.length) {
      let refreshUnits = false
      const highestPrio = controls.units[0].prio
      const highestPrioUnits = controls.units.filter((unit) => unit.prio === highestPrio)
      controls.units = controls.units.filter((unit) => unit.prio < highestPrio)

      const totalCost = {}
      let maxBulkHire = 50

      while (!state.scriptPaused && highestPrioUnits.length && !isFull()) {
        for (let i = 0; i < highestPrioUnits.length && !state.scriptPaused && !isFull(); i++) {
          const unit = highestPrioUnits[i]

          if (unit.gen) {
            for (let i = 0; i < unit.gen.length; i++) {
              const gen = unit.gen[i]
              if (gen.type === 'resource') {
                totalCost[gen.id] = totalCost[gen.id] ? totalCost[gen.id] : 0
                totalCost[gen.id] += gen.value
              }
            }
          }

          if (unit.max - unit.count < 10) {
            maxBulkHire = 1
          } else if (unit.max - unit.count < 50) {
            maxBulkHire = Math.min(maxBulkHire, 10)
          }
        }

        if (maxBulkHire > 1) {
          const usedResources = Object.keys(totalCost)
          for (let i = 0; i < usedResources.length && maxBulkHire > 1; i++) {
            const resId = usedResources[i]
            const resource = resources.get(translate(resId, 'res_'))
            if (resource && totalCost[resId] < 0) {
              if (resource.speed + 10 * totalCost[resId] < 0) {
                maxBulkHire = Math.min(1, maxBulkHire)
              } else if (resource.speed + 50 * totalCost[resId] < 0) {
                maxBulkHire = Math.min(10, maxBulkHire)
              }
            }
          }
        }

        controls.counts[maxBulkHire].click()
        await sleep(25)

        let shouldHire = true
        const unit = highestPrioUnits.shift()

        shouldHire = !unit.gen
          .filter((gen) => gen.type === 'resource')
          .find((gen) => !resources.get(translate(gen.id, 'res_')) || resources.get(translate(gen.id, 'res_')).speed + maxBulkHire * gen.value <= 0)

        if (shouldHire) {
          unit.button.click()
          logger({ msgLevel: 'log', msg: `Hiring ${maxBulkHire} ${unit.id}(s) (current: ${unit.count}, target: ${unit.max})` })
          refreshUnits = true
          await sleep(25)
          if (!navigation.checkPage(CONSTANTS.PAGES.ARMY, CONSTANTS.SUBPAGES.ARMY)) return
        }
      }
      await sleep(1400)

      if (refreshUnits) {
        controls = getControls()
      }
    }
  }
}

export default {
  page: CONSTANTS.PAGES.ARMY,
  subpage: CONSTANTS.SUBPAGES.ARMY,
  enabled: () => userEnabled() && navigation.hasPage(CONSTANTS.PAGES.ARMY),
  action: async () => {
    await navigation.switchSubPage(CONSTANTS.SUBPAGES.ARMY, CONSTANTS.PAGES.ARMY)

    if (isFull()) return

    if (navigation.checkPage(CONSTANTS.PAGES.ARMY, CONSTANTS.SUBPAGES.ARMY)) await executeAction()
  },
}
