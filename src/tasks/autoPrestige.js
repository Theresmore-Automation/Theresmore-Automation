import { legacies } from '../data'
import { logger, sleep, state, translate, localStorage, reactUtil, keyGen } from '../utils'

const getEnabledLegacies = () => {
  const enabledLegaciesOptions = state.options.prestige.options ?? {}

  if (Object.keys(enabledLegaciesOptions).length) {
    let enabledLegacies = Object.keys(enabledLegaciesOptions)
      .filter((key) => !!enabledLegaciesOptions[key])
      .map((key) => {
        const legacy = {
          key: key,
          id: translate(key, 'leg_'),
          prio: enabledLegaciesOptions[key],
        }

        legacy.cost = legacies.find((leg) => leg.id === key).req.find((req) => req.id === 'legacy').value
        return legacy
      })

    return enabledLegacies
  }

  return []
}

const autoPrestige = async () => {
  if (!state.options.prestige.enabled) return

  let buttons = [...document.querySelectorAll('h3.modal-title')].map((h3) => [...h3.parentElement.querySelectorAll('button.btn')]).flat()

  if (!buttons.find((button) => keyGen.legacy.check(reactUtil.getNearestKey(button, 6)))) {
    return
  }
  logger({ msgLevel: 'log', msg: `Picking prestige.` })
  const enabledLegacies = getEnabledLegacies()
  const activeLegacies = buttons
    .filter((button) => !button.classList.contains('btn-red') && !button.classList.toString().includes('btn-off'))
    .map((button) => {
      const id = reactUtil.getNearestKey(button, 6)
      const legacyData = enabledLegacies.find((leg) => `leg_${leg.key}` === id)

      if (legacyData) {
        return {
          button,
          prio: legacyData.prio,
          cost: legacyData.cost,
        }
      }
    })
    .filter((legacy) => legacy)
    .sort((a, b) => {
      if (a.prio === b.prio) return a.cost - b.cost
      return b.prio - a.prio
    })

  for (let i = 0; i < activeLegacies.length; i++) {
    activeLegacies[i].button.click()
    await sleep(1)
  }

  let prestigeButton = buttons.find((button) => button.classList.contains('btn-red') && button.classList.contains('px-6'))
  if (prestigeButton) {
    localStorage.set('lastVisited', {})
    state.stopAutoClicking = true
    state.stopAttacks = false
    state.haveManualResourceButtons = true

    await sleep(300, true)
    prestigeButton.click()
    await sleep(2000, true)

    let redConfirmButton = [...document.querySelectorAll('#headlessui-portal-root .btn.btn-red')].find((button) => reactUtil.getBtnIndex(button, 0) === 1)
    while (redConfirmButton) {
      redConfirmButton.click()
      await sleep(1000, true)

      redConfirmButton = [...document.querySelectorAll('#headlessui-portal-root .btn.btn-red')].find((button) => reactUtil.getBtnIndex(button, 0) === 1)
    }

    await sleep(1000, true)
    state.stopAutoClicking = false
  }
}

export default autoPrestige
