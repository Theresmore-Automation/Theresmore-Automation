import { sleep, state, translate, localStorage } from '../utils'

const autoPrestige = async () => {
  if (!state.options.prestige.enabled) return

  let prestigeButton = [...document.querySelectorAll('.btn.btn-red')].find((button) => button.innerText.includes('Prestige'))
  if (prestigeButton) {
    localStorage.set('lastVisited', {})
    state.haveManualResourceButtons = true

    prestigeButton.click()
    await sleep(5000)

    let redConfirmButton = [...document.querySelectorAll('.btn.btn-red')].find((button) => button.innerText.includes('Confirm'))
    while (redConfirmButton) {
      redConfirmButton.click()
      await sleep(2000)

      redConfirmButton = [...document.querySelectorAll('.btn.btn-red')].find((button) => button.innerText.includes('Confirm'))
    }
  }
}

export default autoPrestige
