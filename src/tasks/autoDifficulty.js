import { state, translate } from '../utils'

const autoDifficulty = async () => {
  if (!state.options.difficulty.enabled) return

  const diffucultyModalTitle = [...document.querySelectorAll('h3.modal-title')].find((h3) => h3.innerText.trim() === translate('difficulty'))

  if (diffucultyModalTitle) {
    const diffucultyOptions = [...diffucultyModalTitle.parentElement.querySelectorAll('div.p-4 h5')]

    if (!state.options.difficulty.selected) {
      diffucultyOptions[0].click()
    } else {
      const diffucultyOptionToSelect = diffucultyOptions.find(
        (diffucultyOption) => diffucultyOption.innerText.trim() === translate(state.options.difficulty.selected)
      )
      if (diffucultyOptionToSelect) {
        diffucultyOptionToSelect.click()
      } else {
        diffucultyOptions[0].click()
      }
    }
  }
}

export default autoDifficulty
