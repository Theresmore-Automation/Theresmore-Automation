import { sleep, state, translate, localStorage, reactUtil, keyGen } from '../utils'

const autoPrestige = async () => {
  if (!state.options.prestige.enabled) return

  let buttons = [...document.querySelectorAll('h3.modal-title')].map((h3) => [...h3.parentElement.querySelectorAll('button.btn')]).flat()
  let legacyBtn = buttons.find((button) => keyGen.legacy.check(reactUtil.getNearestKey(button, 6)))
  if (!legacyBtn) {
    return
  }

  let prestigeButton = [...legacyBtn.parentElement.parentElement.parentElement.parentElement.parentElement.querySelectorAll('.btn.btn-red')].find(
    (button) => button
  )
  if (prestigeButton) {
    localStorage.set('lastVisited', {})
    state.stopAttacks = false
    state.haveManualResourceButtons = true

    prestigeButton.click()
    await sleep(5000)

    let redConfirmButton = [...document.querySelectorAll('#headlessui-portal-root .btn.btn-red')].find((button) => reactUtil.getBtnIndex(button, 0) === 1)
    while (redConfirmButton) {
      redConfirmButton.click()
      await sleep(2000)

      redConfirmButton = [...document.querySelectorAll('#headlessui-portal-root .btn.btn-red')].find((button) => reactUtil.getBtnIndex(button, 0) === 1)
    }
  }
}

export default autoPrestige
