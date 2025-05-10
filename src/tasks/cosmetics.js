import { i18n } from '../data'
import { sleep, state, translate } from '../utils'

const resetModals = ['img_annhilator']

const modalsToKill = Object.keys(i18n.en)
  .filter((key) => key.includes('img_') && !key.includes('_description'))
  .map((key) => i18n.en[key])



const hideFullPageOverlay = () => {
  if (!state.scriptPaused && state.options.cosmetics.hideFullPageOverlay.enabled) {
    const modalTitles = [...document.querySelectorAll('#headlessui-portal-root div.modal-container h3.modal-title')]

    modalTitles.forEach((modalTitle) => {
      if (modalTitle) {
        if (!modalsToKill.includes(modalTitle.innerText.trim())) {
          return
        }

        const fullPageOverlay = document.querySelector('#headlessui-portal-root div.absolute.top-0.right-0.z-20.pt-4.pr-4 > button')
        if (fullPageOverlay && fullPageOverlay.innerText.includes('Close')) {
          let isResetModal = false;
          resetModals.forEach(resetModal => {if (modalTitle.innerText.trim() === translate(resetModal)) { isResetModal = true }})
          if (isResetModal) { sleep(250, true) }
          fullPageOverlay.click()
          if (isResetModal) { sleep(500, true) }
        }
      }
    })
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
