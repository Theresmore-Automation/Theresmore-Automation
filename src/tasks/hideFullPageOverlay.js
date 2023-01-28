import { state } from '../utils'

const hideFullPageOverlay = () => {
  if (!state.scriptPaused) {
    const fullPageOverlay = document.querySelector('div.modal-container > div.absolute.top-0.right-0.z-20.pt-4.pr-4 > button')
    if (fullPageOverlay && fullPageOverlay.innerText.includes('Close')) {
      fullPageOverlay.click()
    }
  }
}

export default hideFullPageOverlay
