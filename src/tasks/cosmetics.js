import { state } from '../utils'

const hideFullPageOverlay = () => {
  const modalsToIgnore = ['enemies']

  if (!state.scriptPaused && state.options.cosmetics.hideFullPageOverlay.enabled) {
    const modalContainer = document.querySelector('div.modal-container')

    if (modalContainer) {
      const modalTitle = modalContainer.querySelector('h3.modal-title')

      if (modalTitle && modalsToIgnore.includes(modalTitle.innerText.trim())) {
        return
      }

      const fullPageOverlay = modalContainer.querySelector('div.absolute.top-0.right-0.z-20.pt-4.pr-4 > button')
      if (fullPageOverlay && fullPageOverlay.innerText.includes('Close')) {
        fullPageOverlay.click()
      }
    }
  }
}

const removeToasts = () => {
  const toastify = document.querySelector('div.Toastify')
  const toastifyDisabled = document.querySelector('div.ToastifyDisabled')

  if (toastify && state.options.cosmetics.toasts.enabled) {
    toastify.classList.remove('Toastify')
    toastify.classList.add('toastifyDisabled')
  } else if (toastifyDisabled && !state.options.cosmetics.toasts.enabled) {
    toastify.classList.remove('toastifyDisabled')
    toastify.classList.add('Toastify')
  }
}

export default { hideFullPageOverlay, removeToasts }
