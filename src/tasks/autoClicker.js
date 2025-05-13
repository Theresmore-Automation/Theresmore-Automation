import { sleep, state, reactUtil, keyGen } from '../utils'

const autoClicker = async () => {
  if (!state.haveManualResourceButtons) return
  if (state.scriptPaused) return

  const manualResources = [keyGen.manual.key('food'), keyGen.manual.key('wood'), keyGen.manual.key('stone')]

  while (!state.scriptPaused && state.haveManualResourceButtons) {
    if (state.stopAutoClicking) {
      await sleep(1000)
      continue
    }

    const buttons = [
      ...document.querySelectorAll('#root > div.flex.flex-wrap.w-full.mx-auto.p-2 > div.w-full.lg\\:pl-2 > div > div.order-2.flex.flex-wrap.gap-3 > button'),
    ]

    if (!buttons.length) {
      state.haveManualResourceButtons = false
      return
    }

    const buttonsToClick = buttons.filter((button) => manualResources.includes(reactUtil.getNearestKey(button, 2)))
    if (buttonsToClick.length && !reactUtil.getGameData().SettingsStore.showSettings) {
      while (buttonsToClick.length && !reactUtil.getGameData().SettingsStore.showSettings) {
        const buttonToClick = buttonsToClick.shift()
        buttonToClick.click()
        await sleep(100)
      }
    } else {
      await sleep(1000)
    }
  }
}

export default autoClicker
