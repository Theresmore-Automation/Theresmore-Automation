import { sleep, state, translate } from '../utils'

const autoDifficulty = async () => {
  if (!state.options.difficulty.enabled) return
  const difficultyModalTitle = [...document.querySelectorAll('h3.modal-title')].find((h3) => h3.innerText.trim() === translate('difficulty'))
  if (difficultyModalTitle) {
    state.stopAutoClicking = true
    const difficultyOptions = [...difficultyModalTitle.parentElement.querySelectorAll('div.p-4 h5')]
    if (!state.options.difficulty.selected) {
      difficultyOptions[0].click()
    } else {
      const difficultyOptionToSelect = difficultyOptions.find(
        (difficultyOption) => difficultyOption.innerText.trim() === translate(state.options.difficulty.selected)
      )
      if (difficultyOptionToSelect) {
        difficultyOptionToSelect.click()
      } else {
        difficultyOptions[0].click()
      }
    }
    await sleep(1000, true)
    state.stopAutoClicking = false
  }
}

export default autoDifficulty
