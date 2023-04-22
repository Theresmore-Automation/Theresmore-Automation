import { sleep, state, translate, localStorage, reactUtil, keyGen } from '../utils'

const autoNGPlus = async () => {
  if (!state.options.ngplus.enabled) return

  if (!reactUtil.getGameData() || !reactUtil.getGameData().LegacyStore || !reactUtil.getGameData().LegacyStore.ownedLegacies) return
  if (!reactUtil.getGameData().LegacyStore.ownedLegacies.length) return

  if (state.options.ngplus.value > reactUtil.getGameData().LegacyStore.ownedLegacies.length) return

  const div = [...document.querySelectorAll('#root > div.flex > div')].find((div) => reactUtil.getBtnIndex(div, 0) === 2)
  if (!div) return

  const ngButton = [...div.querySelectorAll('button')].find((button) => reactUtil.getBtnIndex(button, 0) === 5)
  if (!ngButton) return

  localStorage.set('lastVisited', {})
  state.stopAutoClicking = true
  state.stopAttacks = false
  state.haveManualResourceButtons = true

  await sleep(300)
  ngButton.click()
  await sleep(5000)

  let redConfirmButton = [...document.querySelectorAll('#headlessui-portal-root .btn.btn-red')].find((button) => reactUtil.getBtnIndex(button, 0) === 0)
  while (redConfirmButton) {
    redConfirmButton.click()
    await sleep(2000)

    redConfirmButton = [...document.querySelectorAll('#headlessui-portal-root .btn.btn-red')].find((button) => reactUtil.getBtnIndex(button, 0) === 1)
  }

  state.stopAutoClicking = false
}

export default autoNGPlus
