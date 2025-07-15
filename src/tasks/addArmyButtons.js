import { CONSTANTS, navigation, sleep } from '../utils'

const removeAllUnits = async (button) => {
  let removeButton = button.parentElement.parentElement.querySelector('div.inline-flex button.btn-red.lg\\:hidden')
  while (removeButton) {
    removeButton.click()
    await sleep(10)
    removeButton = button.parentElement.parentElement.querySelector('div.inline-flex button.btn-red.lg\\:hidden')
  }
}

const addAllUnits = async (button) => {
  let addButton = button.parentElement.parentElement.querySelector('div.inline-flex button.btn-green.lg\\:hidden')
  while (addButton) {
    addButton.click()
    await sleep(10)
    addButton = button.parentElement.parentElement.querySelector('div.inline-flex button.btn-green.lg\\:hidden')
  }
}

const getRemoveAllButton = () => {
  const removeAllButton = document.createElement('div')
  removeAllButton.classList.add('absolute', 'top-0', 'right-14')
  removeAllButton.innerHTML = `<button type="button" class="text-gray-400 dark:text-mydark-100 hover:text-blue-600 dark:hover:text-blue-500 focus:text-blue-600 dark:focus:text-blue-500">
  <svg viewBox="0 0 24 24" role="presentation" class="icon"><path d="M12 2C17.5 2 22 6.5 22 12S17.5 22 12 22 2 17.5 2 12 6.5 2 12 2M12 4C10.1 4 8.4 4.6 7.1 5.7L18.3 16.9C19.3 15.5 20 13.8 20 12C20 7.6 16.4 4 12 4M16.9 18.3L5.7 7.1C4.6 8.4 4 10.1 4 12C4 16.4 7.6 20 12 20C13.9 20 15.6 19.4 16.9 18.3Z" style="fill: currentcolor;"></path></svg>
  </button>`

  removeAllButton.addEventListener('click', function (e) {
    removeAllUnits(e.currentTarget)
  })

  return removeAllButton
}

const getAddAllButton = () => {
  const addAllButton = document.createElement('div')
  addAllButton.classList.add('absolute', 'top-0', 'right-7')
  addAllButton.innerHTML = `<button type="button" class="text-gray-400 dark:text-mydark-100 hover:text-blue-600 dark:hover:text-blue-500 focus:text-blue-600 dark:focus:text-blue-500">
  <svg viewBox="0 0 24 24" role="presentation" class="icon"><path d="M19.5,3.09L20.91,4.5L16.41,9H20V11H13V4H15V7.59L19.5,3.09M20.91,19.5L19.5,20.91L15,16.41V20H13V13H20V15H16.41L20.91,19.5M4.5,3.09L9,7.59V4H11V11H4V9H7.59L3.09,4.5L4.5,3.09M3.09,19.5L7.59,15H4V13H11V20H9V16.41L4.5,20.91L3.09,19.5Z" style="fill: currentcolor;"></path></svg>
  </button>`

  addAllButton.addEventListener('click', function (e) {
    addAllUnits(e.currentTarget)
  })

  return addAllButton
}

const allowedSubpages = [CONSTANTS.SUBPAGES.ATTACK, CONSTANTS.SUBPAGES.GARRISON, CONSTANTS.SUBPAGES.EXPLORE]

const addArmyButtons = () => {
  const isCorrectPage = allowedSubpages.find((subpage) => navigation.checkPage(CONSTANTS.PAGES.ARMY, subpage))

  if (isCorrectPage) {
    const container = document.querySelector('div.tab-container.sub-container:not(.addArmyButtonsDone)')

    if (container) {
      const boxes = [...container.querySelectorAll('div.flex > div.grid > div.flex')]
      boxes.shift()

      boxes.forEach((box) => {
        box.querySelector('div.flex-1.text-center.relative.mb-2').insertAdjacentElement('beforeend', getAddAllButton())
        box.querySelector('div.flex-1.text-center.relative.mb-2').insertAdjacentElement('beforeend', getRemoveAllButton())
      })

      container.classList.add('addArmyButtonsDone')
    }
  }
}

export default addArmyButtons
