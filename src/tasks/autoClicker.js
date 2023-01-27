import { sleep, state } from '../utils'

let haveManualResourceButtons = true

const autoClicker = async () => {
  if (!haveManualResourceButtons) return
  if (state.scriptPaused) return

  const manualResources = ['Food', 'Wood', 'Stone']

  while (!state.scriptPaused && haveManualResourceButtons) {
    const buttons = [
      ...document.querySelectorAll('#root > div.flex.flex-wrap.w-full.mx-auto.p-2 > div.w-full.lg\\:pl-2 > div > div.order-2.flex.flex-wrap.gap-3 > button'),
    ]

    if (!buttons.length) {
      haveManualResourceButtons = false
      return
    }

    const buttonsToClick = buttons.filter((button) => manualResources.includes(button.innerText.trim()))
    while (buttonsToClick.length) {
      const buttonToClick = buttonsToClick.shift()
      buttonToClick.click()
      await sleep(100)
    }
  }
}

export default autoClicker
