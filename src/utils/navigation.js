import CONSTANTS from './constants'
import logger from './logger'
import sleep from './sleep'

const getPagesSelector = () => {
  return [...document.querySelectorAll('#main-tabs > div > button')]
}

const getCurrentPageSelector = () => {
  return document.querySelector('#main-tabs > div > button[aria-selected="true"]')
}

const getSubPagesSelector = () => {
  const tabLists = [...document.querySelectorAll('div[role="tablist"]')]

  if (tabLists && tabLists.length >= 2) {
    return [...tabLists[1].querySelectorAll('button')]
  }

  return []
}

const getCurrentSubPageSelector = () => {
  let currentSubPage

  const subPages = getSubPagesSelector()
  if (subPages.length) {
    currentSubPage = subPages.find((subPage) => subPage.getAttribute('aria-selected') === 'true')
  }

  return currentSubPage
}

const hasPage = (page) => {
  const navButtons = getPagesSelector()

  return !!navButtons.find((button) => button.innerText.includes(page))
}

const checkPage = (page, subPage) => {
  const currentPage = getCurrentPageSelector()
  const currentSubPage = getCurrentSubPageSelector()

  const isCorrectPage = !page || (page && currentPage && currentPage.innerText.includes(page))
  const isCorrectSubPage = !subPage || (subPage && currentSubPage && currentSubPage.innerText.includes(subPage))

  return isCorrectPage && isCorrectSubPage
}

const hasSubPage = (subPage) => {
  const subTabs = getSubPagesSelector()

  return !!subTabs.find((button) => button.innerText.includes(subPage))
}

const switchPage = async (page) => {
  let foundPage = hasPage(page)
  if (!foundPage) {
    await switchPage(CONSTANTS.PAGES.BUILD)
    return
  }

  let switchedPage = false

  const navButtons = getPagesSelector()
  const pageButton = navButtons.find((button) => button.innerText.includes(page) && button.getAttribute('aria-selected') !== 'true')

  if (pageButton) {
    pageButton.click()
    switchedPage = true
  }

  await sleep(2000)

  if (switchedPage) {
    logger({ msgLevel: 'debug', msg: `Switched page to ${page}` })
  }
}

const switchSubPage = async (subPage, page) => {
  if (page) {
    await switchPage(page)
  }

  let foundSubPage = hasSubPage(subPage)
  if (foundSubPage) {
    let switchedSubPage = false

    const navButtons = getSubPagesSelector()
    const subPageButton = navButtons.find((button) => button.innerText.includes(subPage) && button.getAttribute('aria-selected') !== 'true')

    if (subPageButton) {
      subPageButton.click()
      switchedSubPage = true
    }

    await sleep(2000)

    if (switchedSubPage) {
      logger({ msgLevel: 'debug', msg: `Switched subPage to ${subPage}` })
    }
  }
}

export default { getPagesSelector, hasPage, switchPage, checkPage, switchSubPage }
