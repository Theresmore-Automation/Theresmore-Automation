import { CONSTANTS, navigation, sleep, reactUtil } from '../utils'

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

const moveLeft = async (button) => {
  if (!reactUtil.getGameData().ArmyStore.orderByBattleOrder) {
    return
  }

  const unitKey = reactUtil.getNearestKey(button.parentElement)
  const unitName = unitKey.replace('army_combat_', '').replace('army_defense_', '')

  let type

  if (unitKey.includes('army_combat_')) {
    type = 'away'
  } else {
    type = 'defense'
  }

  const position = reactUtil.getGameData().run.armyOrder[type].indexOf(unitName)
  if (position < 1 || (type === 'defense' && position === 1)) {
    return
  }

  const prev = reactUtil.getGameData().run.armyOrder[type][position - 1]
  reactUtil.getGameData().run.armyOrder[type][position - 1] = reactUtil.getGameData().run.armyOrder[type][position]
  reactUtil.getGameData().run.armyOrder[type][position] = prev
}

const moveRight = async (button) => {
  if (!reactUtil.getGameData().ArmyStore.orderByBattleOrder) {
    return
  }

  const unitKey = reactUtil.getNearestKey(button.parentElement)
  const unitName = unitKey.replace('army_combat_', '').replace('army_defense_', '')

  let type

  if (unitKey.includes('army_combat_')) {
    type = 'away'
  } else {
    type = 'defense'
  }

  const position = reactUtil.getGameData().run.armyOrder[type].indexOf(unitName)
  if (position === -1 || position === reactUtil.getGameData().run.armyOrder[type].length - 1) {
    return
  }

  const next = reactUtil.getGameData().run.armyOrder[type][position + 1]
  reactUtil.getGameData().run.armyOrder[type][position + 1] = reactUtil.getGameData().run.armyOrder[type][position]
  reactUtil.getGameData().run.armyOrder[type][position] = next
}

const getRemoveAllButton = () => {
  const removeAllButton = document.createElement('div')
  removeAllButton.classList.add('absolute', 'right-7')
  removeAllButton.style = 'top: 1.5rem'
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
  addAllButton.classList.add('absolute', 'right-0')
  addAllButton.style = 'top: 1.5rem'
  addAllButton.innerHTML = `<button type="button" class="text-gray-400 dark:text-mydark-100 hover:text-blue-600 dark:hover:text-blue-500 focus:text-blue-600 dark:focus:text-blue-500">
  <svg viewBox="0 0 24 24" role="presentation" class="icon"><path d="M19.5,3.09L20.91,4.5L16.41,9H20V11H13V4H15V7.59L19.5,3.09M20.91,19.5L19.5,20.91L15,16.41V20H13V13H20V15H16.41L20.91,19.5M4.5,3.09L9,7.59V4H11V11H4V9H7.59L3.09,4.5L4.5,3.09M3.09,19.5L7.59,15H4V13H11V20H9V16.41L4.5,20.91L3.09,19.5Z" style="fill: currentcolor;"></path></svg>
  </button>`

  addAllButton.addEventListener('click', function (e) {
    addAllUnits(e.currentTarget)
  })

  return addAllButton
}

const getMoveLeftButton = () => {
  const moveLeftButton = document.createElement('div')
  moveLeftButton.classList.add('absolute', 'left-0')
  moveLeftButton.style = 'top: 1.5rem'
  moveLeftButton.innerHTML = `<button type="button" class="text-gray-400 dark:text-mydark-100 hover:text-blue-600 dark:hover:text-blue-500 focus:text-blue-600 dark:focus:text-blue-500">
  <svg viewBox="0 0 24 24" role="presentation" class="icon"><path d="m4.431 12.822 13 9A1 1 0 0 0 19 21V3a1 1 0 0 0-1.569-.823l-13 9a1.003 1.003 0 0 0 0 1.645z" style="fill: currentcolor;"></path></svg>
  </button>`

  moveLeftButton.addEventListener('click', function (e) {
    moveLeft(e.currentTarget)
  })

  return moveLeftButton
}

const getMoveRightButton = () => {
  const moveRightButton = document.createElement('div')
  moveRightButton.classList.add('absolute')
  moveRightButton.style = 'top: 1.5rem; left: 1.25rem;'
  moveRightButton.innerHTML = `<button type="button" class="text-gray-400 dark:text-mydark-100 hover:text-blue-600 dark:hover:text-blue-500 focus:text-blue-600 dark:focus:text-blue-500">
  <svg viewBox="0 0 24 24" role="presentation" class="icon"><path d="M5.536 21.886a1.004 1.004 0 0 0 1.033-.064l13-9a1 1 0 0 0 0-1.644l-13-9A1 1 0 0 0 5 3v18a1 1 0 0 0 .536.886z" style="fill: currentcolor;"></path></svg>
  </button>`

  moveRightButton.addEventListener('click', function (e) {
    moveRight(e.currentTarget)
  })

  return moveRightButton
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
        box.querySelector('div.flex-1.text-center.relative.mb-2').insertAdjacentElement('beforeend', getMoveLeftButton())
        box.querySelector('div.flex-1.text-center.relative.mb-2').insertAdjacentElement('beforeend', getMoveRightButton())
        const costBox = box.querySelector('div.my-4')
        if (costBox) {
          costBox.classList.toggle('my-4')
          costBox.style = 'margin-top: 1.75rem; margin-bottom: 1.5rem;'
        } else {
          const nameBox = box.querySelector('div.flex-1.text-center.relative')
          if (nameBox) {
            nameBox.classList.toggle('mb-2')
            nameBox.classList.toggle('mb-7')
            nameBox.classList.toggle('lg:mb-4')
          }
        }
      })

      container.classList.add('addArmyButtonsDone')
    }
  }
}

export default addArmyButtons
