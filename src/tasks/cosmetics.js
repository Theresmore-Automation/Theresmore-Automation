import { state, reactUtil } from '../utils'

const modalsToIgnore = ['enemies']

const hideFullPageOverlay = () => {
  if (!state.scriptPaused && state.options.cosmetics.hideFullPageOverlay.enabled) {
    const modalContainer = document.querySelector('div.modal-container')

    if (modalContainer) {
      const modalTitle = modalContainer.querySelector('h3.modal-title')
      if (modalTitle) {
        if (modalsToIgnore.includes(modalTitle.innerText.trim())) {
          return
        }

        //enemies
        const enemyList = [...modalTitle.parentElement.querySelectorAll('h5')]
          .map((h5) => {
            const key = reactUtil.getNearestKey(h5, 2)
            return keyGen.enemy.check(key)
          })
          .filter((isEnemy) => isEnemy)
        if (enemyList.length) {
          return
        }
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
